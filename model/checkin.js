var Model = require("./base");
var CheckinModel = new Model("checkin");
var hook = require("../util/webhook");
var logger = require("../logger");



module.exports = CheckinModel;

CheckinModel.add = function(data,callback){
    hook.trigger(data.clubId,"checkin.add",data);
	this.db.query("insert into " + this.table + " set ?",data,function(err,results){
        if(err){
            return callback(err);
        }else{
            callback(null,results);
        }
    });
}

CheckinModel.isMemberChecked = function(memberId, activityId, callback){
    var query = this.db.query("select * from checkin where activityId=? and memberId=?", [activityId, memberId],function(err,data){
        if(err){return callback(err);}
        callback(null, data.length > 0);
    });
    logger.info(query.sql);
}

CheckinModel.removeFromActivity = function(activityId, callback){
    var query = this.db.query("delete from checkin where activityId=?", [activityId], callback);
}

CheckinModel.getHistoryByClubId = function(clubId,callback){
    this.db.query("select * from " + this.table + " where clubId = ? order by id limit 0,50",clubId,callback);
}