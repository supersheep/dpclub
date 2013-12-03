var dpclub = app();

dpclub.controller("home",function(router,deps){
    $("#main").empty();
    var html = dpclub.render(deps.template,{
        items:deps.data
    });
    $("#main").html(html);
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

    var items =  deps.data.checkin || [];

    var template = deps.template;

    function render(){
        var main = $("#main");
        main.empty();
        main.html(dpclub.render(template,{
            activity:deps.data.activity,
            items:items.map(function(item){
                item.time = new Date(item.addDate).format("yyyy-MM-dd hh:mm");
                return item
            })
        }));
        $("#btn-checkin").on("click",logMember);
    }

    function logMember(){
        var memberId = prompt("工号：");
        if(!memberId.match(/\d+/)){
            alert("工号总归要是数字吧同学");
            return;
        }
        $.post("/api/checkin/add",{
            memberId:memberId,
            activityId:deps.data.activity.id
        }).done(function(data){
            items.unshift(data);
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
        url: encodeURIComponent(location.protocol + "//" + location.host + "/activity/" + deps.data.id + "#from=qr")
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
