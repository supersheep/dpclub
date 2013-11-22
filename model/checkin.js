var Model = require("./base");
var CheckinModel = new Model("checkin");

module.exports = CheckinModel;

CheckinModel.add = function(clubId,memberId,memberName,callback){
	this.db.query("insert into " + this.table + " set ?",{
		clubId:clubId,
		memberId:memberId,
        memberName:memberName,
		addDate:new Date()
	},function(err,results){
        if(err){
            return callback(err);
        }else{
            callback(null,results);
        }
    });
}

CheckinModel.isMemberCheckedToday = function(clubId,memberId,callback){
    var now = new Date();
    var today = [now.getFullYear(),now.getMonth()+1,now.getDate()].join("-");
    var tomorrow = [now.getFullYear(),now.getMonth()+1,now.getDate()+1].join("-");
    console.log("select * from checkin where clubId=" + clubId + " and memberId=" + memberId + " and addDate < " + tomorrow + " and addDate > " + today);
    this.db.query("select * from checkin where clubId=? and memberId=? and addDate < ? and addDate > ?",[clubId, memberId, tomorrow, today],function(err,data){
        if(err){return callback(err);}
        callback(null,data.length);
    });
}

CheckinModel.getHistoryByClubId = function(clubId,callback){
    this.db.query("select * from " + this.table + " where clubId = ? order by id limit 0,50",clubId,callback);
}