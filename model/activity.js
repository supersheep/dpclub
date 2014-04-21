var Model = require("./base");
var clubModel = require("./club");
var ActicityModel = new Model("activity");


module.exports = ActicityModel;

ActicityModel.create = function(data,callback){
    var self = this;
    var time = new Date(data.time);
    var clubId = data.club;
    var title = data.title;

    var now = new Date();
    if(time.toString() === "Invalid Date"){
        return callback("无效的时间");
    }

    if(time < now){
        return callback("活动时间应当晚于当前时间");
    }

    clubModel.one({
        id:clubId
    },function(err,club){
        if(err){return callback(err);}
        if(!club){return callback("not found");}
        insertIntoClub(club);
    });

    function insertIntoClub(club){
        self.db.query("insert into " + self.table + " set ?",{
            clubId:club.id,
            time:time,
            title:title,
            addTime:now
        },function(err,result){
            if(err){return callback(err);}
            callback(null,result);
        });
    }
}

ActicityModel.getHistoryByClubId = function(clubId,callback){
    this.db.query("select * from " + this.table + " where clubId = ? and removed is NULL order by id desc limit 0,50",clubId,callback);
}

ActicityModel.removeById = function(id, callback){
    this.db.query("update activity set removed=1 where id=?",id,callback);
}