var CheckinModel = require("../../model/checkin");
var MemberModel = require("../../model/member");
var ActivityModel = require("../../model/activity");
var async = require("async");

exports.add = function(req,res,next){
	var memberId = req.body.memberId;
	var activityId = req.body.activityId;

	async.waterfall([function(done){
		CheckinModel.isMemberCheckedToday(activityId,memberId,done);
	},function(checkedToday,done){
		if(checkedToday){return done("checked");}
		MemberModel.getNameById(memberId,done); // request junyi's api
	},function(memberName,done){
		ActivityModel.find({
			id:activityId
		},function(err,result){
			if(err){return done(err);}
			done(null,memberName,result[0].clubId);
		});
	},function(memberName,clubId,done){
		CheckinModel.add({
			activityId:activityId,
			clubId:clubId,
			memberId:memberId,
			memberName:memberName,
			addDate:new Date()
		},done);
	},function(insertInfo,done){
		CheckinModel.one({
			id:insertInfo.insertId
		},done);
	}],function(err,data){
		if(err){
			if(err === "checked"){
				return res.send(403,"already checked");
			}else if(err == "memberId not found"){
				return res.send(403,"memberId not found");
			}else{
				return res.send(500,err);
			}	
		}
		return res.send(200,data);
	});
}

exports.list = function(req,res,next){
	
}