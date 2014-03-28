var Model = require("./base");
var CheckinModel = require("./checkin");
var ClubModel = new Model("club");
var logger = require("../logger");

module.exports = ClubModel;

ClubModel.distinctMember = function(clubId, callback){
    var query = this.db.query("select  DISTINCT  `memberId` , `memberName` from checkin where clubId = ?", clubId, callback );
    logger.info(query.sql);
}

ClubModel.checkins = function(clubId, callback){
    var query = this.db.query("select memberName,`activity`.`title`,`activity`.`time`  from checkin,activity where checkin.clubId=? and `activity`.`id` = checkin.`activityId` order by activity.id", clubId, callback);
    logger.info(query.sql);
}