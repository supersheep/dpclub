var Model = require("./base");
var CheckinModel = new Model("checkin");

module.exports = CheckinModel;

CheckinModel.add = function(data,callback){
	this.db.query("insert into " + this.table + " set ?",data,function(err,results){
        if(err){
            return callback(err);
        }else{
            callback(null,results);
        }
    });
}

CheckinModel.isMemberCheckedToday = function(activityId,memberId,callback){
    var now = new Date();
    var today = [now.getFullYear(),now.getMonth()+1,now.getDate()].join("-");
    var tomorrow = [now.getFullYear(),now.getMonth()+1,now.getDate()+1].join("-");
    this.db.query("select * from checkin where activityId=? and memberId=? and addDate < ? and addDate > ?",[activityId, memberId, tomorrow, today],function(err,data){
        if(err){return callback(err);}
        callback(null,data.length);
    });
}

CheckinModel.getHistoryByClubId = function(clubId,callback){
    this.db.query("select * from " + this.table + " where clubId = ? order by id limit 0,50",clubId,callback);
}