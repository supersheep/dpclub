(function(){
    var controllers = {
        "home":function(){
            $.getJSON("/api/club",function(data){
                var ul = $("<ul class='list-group' />");
                data.forEach(function(item){
                    var li = $("<li class='list-group-item'>");
                    var a = $("<a href='/club/" + item.id + "' />").html(item.name);
                    a.appendTo(li);
                    li.appendTo(ul);
                });
                ul.appendTo($("#main"));
                $(".navbar button.navbar-toggle").remove();
            });
            $("#checkin-btn").hide();
        },
        "club":function(clubId){
            var main = $("#main");
            var button_nav = $('<button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse"><span class="glyphicon glyphicon-check"></span></button>');
            var button_empty = $('<button class="btn btn-default" id="btn-empty" type="button" data-toggle="collapse"><span class="glyphicon glyphicon-check"></span></button>');
            
            function addItem(data,ul){
                var li = $("<li  class='list-group-item' />");
                var date = new Date(data.addDate);
                var date_formatted = [date.getFullYear(),date.getMonth()+1,date.getDate()].join("-") + " " + [date.getHours(),date.getMinutes()].join(":");
                li.html(data.memberName + "<span style='margin-left:5px'>(" + data.memberId + ")</span>" + "<span style='float:right;color:#999;' class='add-time'>" + date_formatted + "</span>");
                $("#main ul").prepend(li);   
            }

            function logMember(){
                var memberId = prompt("工号：");
                if(!memberId.match(/\d+/)){
                    alert("工号总归要是数字吧同学");
                    return;
                }
                $.post("/api/checkin",{
                    memberId:memberId,
                    clubId:clubId
                },function(data){
                    if(!$("#main ul").length){
                        $('<ul class="list-group">').appendTo($("#main"));
                    }
                    addItem(data,$("#main ul"));
                    $("#main button").remove();
                    
                }).fail(function(xhr){
                    alert(xhr.responseText);
                });
            }

            button_nav.appendTo($(".navbar-header"));
            button_nav.on("click",logMember);

            $.getJSON("/api/club/"+clubId,function(data){
                if(!data.length){
                    button_empty.appendTo($("#main"));
                    button_empty.on("click",logMember);
                }else{
                    var ul = $('<ul class="list-group">').appendTo($("#main"));
                    data.forEach(function(item){
                        addItem(item,ul);
                    });
                }
            });
        }
    }

    $(document).delegate("a","click",function(){
        History.pushState(null, null, $(this).attr("href"));
        return false;
    });


    function router(path){
        var match_club = path.match(/^\/club\/(\d+)/);

        $("#main").empty();

        if(match_club){
            controllers.club(match_club[1]);
        }else{
            controllers.home();
        }
    }

    // Bind to StateChange Event
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        var hash = State.hash;
        router(hash);
    });

    router(location.pathname);
})()