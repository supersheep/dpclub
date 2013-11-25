var CheckinModel = require("../../model/checkin");
var MemberModel = require("../../model/member");
var async = require("async");

exports.add = function(req,res,next){
	var memberId = req.body.memberId;
	var clubId = req.body.clubId;

	async.waterfall([function(done){
		CheckinModel.isMemberCheckedToday(clubId,memberId,done);
	},function(checkedToday,done){
		if(checkedToday){return done("checked");}
		MemberModel.getNameById(memberId,done);
	},function(memberName,done){
		CheckinModel.add(clubId,memberId,memberName,done);
	},function(insertInfo,done){
		CheckinModel.getById(insertInfo.insertId,done);
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
		console.log(data,arguments);
		return res.send(200,data);
	});
}