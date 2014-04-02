var dpclub = app();

function convertImgToBase64(url, callback, outputFormat){
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        img = new Image;
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        // Clean up
        canvas = null;
    };
    img.src = url;
}

dpclub.on && dpclub.on("resolving", function(){
    $(".loading").show();
});


dpclub.on && dpclub.on("error", function(e){
    alert("我坏掉了：" + JSON.stringify(e) );
})

dpclub.on && dpclub.on("resolved", function(){
    $(".loading").hide();
    var wrapper = $("#wrapper");
    var main = $("#main");
    var winHeight = $(window).height() + 60;

    wrapper.get(0).scrollTop = 0;
    wrapper.css("height", winHeight);
    main.css("height", winHeight + 10);
    setTimeout(function(){
        scrollTo(0,0);
    },10);
});

dpclub.controller("home",function(router,deps){
    var main = $("#main");
    var localHtml = localStorage.homeHtml;
    var renderHtml = dpclub.render(deps.template,{
        items:deps.data
    });

    function imageDataURLPromise(i, img){
        var deferred = $.Deferred();
        convertImgToBase64(img.src, function(dataUrl){
            img.src = dataUrl;
            deferred.resolve();
        });
        return deferred.promise();
    }

    main.empty();


    main.html(localHtml || renderHtml);
    var tempElem = $(renderHtml);
    app.q.list( tempElem.find("img").map(imageDataURLPromise) ).then(function(){
        localStorage.homeHtml = tempElem.html();
    });
});

dpclub.controller("club",function(router,deps){
    var items = deps.data.map(function(item){
        item.time = new Date(item.time).format("yyyy-MM-dd hh:mm");
        return item
    }) || [];
    var template = deps.template;

    $("#main").html(dpclub.render(template,{
        id:router.params.id,
        items:items
    }));
});

dpclub.controller("activity",function(router,deps){

    var checkins =  deps.data.checkin || [];
    var members = [];
    var template = deps.template;
    var batch_modal = null;
    function render(){
        var main = $("#main");
        main.empty();
        main.html(dpclub.render(template,{
            activity:deps.data.activity,
            checkins:checkins.map(function(item){
                item.time = new Date(item.addDate).format("yyyy-MM-dd hh:mm");
                return item
            })
        }));
        $("#remove-activity").on("click",removeActivity);
        $("#btn-checkin").on("click",logMember);
        $("#btn-batch-checkin").on("click",loadMembers);
        $("#batch-checkin-modal .btn-primary").on("click", function(){
            var data = $("#batch-checkin-modal .checked").map(function(e){
                return {
                    id: $(this).attr("data-id"),
                    name: $(this).text()
                };
            }).get();

            batchLogMember(data);
        });
    }

    function memberChecked(member){
        return checkins.some(function(item){
            return item.memberId == member.memberId;
        });
    }

    function removeActivity(){
        var id = deps.data.activity.id;
        var clubId = deps.data.activity.clubId;
        var sure = confirm("确认要删除活动么");
        if(sure){
            $.ajax({
                method:"delete",
                url:"/api/activity/" + id,
                success:function(){
                    dpclub.locate("/club/" + clubId + "/activity");
                }
            });
        }
    }

    function loadMembers(){
        var member_template = '<ul class="list-group">'+
        '<% members.forEach(function(member){ %>'+
            '<li class="list-group-item" data-id="<%= member.memberId %>"><%= member.memberName %></li>'+
        '<% }); %>'
        '</ul>';

        $(".loading").show();
        $.getJSON("/api/club/" + deps.data.activity.clubId + "/members").done(function(members){
            $(".loading").hide();
            members = members.filter(function(member){
                return member.memberName && !memberChecked(member);
            });

            batch_modal = $("#batch-checkin-modal");

            batch_modal.find(".modal-body").html(dpclub.render(member_template,{
                members: members
            }));
            batch_modal.find(".list-group-item").on("click",function(){
                $(this).toggleClass("checked");
            });
            $(".loading").hide();
        }, "json");
    }

    function batchLogMember(members){
        $("#batch-checkin-modal").modal("hide");
        $(".loading").show();
        $.post("/api/checkin/batchadd",{
            members: JSON.stringify(members),
            activityId: deps.data.activity.id
        }).done(function(results){
            $(".loading").hide();
            $("#batch-checkin-modal").modal("hide").on('hidden.bs.modal',function(){

                results.forEach(function(data){
                    checkins.unshift(data);
                });
                render();
            });
        }).fail(function(xhr){
            alert(xhr.responseText);
        });;
    }

    function logMember(memberId){
        var memberId = prompt("工号：");
        if(!memberId){return;}
        if(!memberId.match(/\d+/)){
            alert("工号总归要是数字吧同学");
            return;
        }
        $.post("/api/checkin/add",{
            memberId:memberId,
            activityId:deps.data.activity.id
        }).done(function(data){
            checkins.unshift(data);
            render();
        }).fail(function(xhr){
            alert(xhr.responseText);
        });
    }

    render();
    if(location.hash === "#from=qr"){
        logMember();
    }
});


dpclub.controller("activity-create",function(router,deps){
    var self = this;
    var data = {};
    $("#main").empty().html(this.render(deps.template,data));
    $("#btn-activity-create").on("click",function(){
        var title = $("#input-activity-name").val();
        var date = $("#input-activity-date").val();
        var time = $("#input-activity-time").val();
        if(!title){alert("请填写活动标题");return;}
        if(!date){alert("请填写活动日期");return;}
        if(!time){alert("请填写活动时间");return;}
        $.post("/api/activity/create",{
            club:router.params.id,
            title:title,
            time: [date,time].join(" ")
        }).done(function(data){
            self.locate("/activity/" + data.insertId);
        }).fail(function(xhr){
            alert(xhr.responseText);
        })
    });
});

dpclub.controller("activity-qr",function(router,deps){
    $("#main").html(this.render(deps.template,{
        activity: deps.data,
        url: encodeURIComponent(location.protocol + "//" + location.host + "/activity/" + deps.data.id)
    }));
});

dpclub.router({
    "/":{
        controller:"home",
        data:"/api/club",
        template:"/template/home.html"
    },
    "/club/:id/activity":{
        controller:"club",
        data:"/api/club/:id/activity",
        template:"/template/activity-list.html"
    },
    "/activity/create?club=:id":{
        cache: true,
        controller:"activity-create",
        template:"/template/activity-create.html"
    },
    "/activity/:id":{
        controller:"activity",
        data:{
            activity:"/api/activity/:id",
            checkin:"/api/activity/:id/checkin"
        },
        template:"/template/checkin-list.html"
    },
    "/activity/:id/qr":{
        controller:"activity-qr",
        data:"/api/activity/:id",
        template:"/template/qr.html"
    }
});

dpclub.init();
