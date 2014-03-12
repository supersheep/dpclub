var CheckinModel = require("../../model/checkin");
var MemberModel = require("../../model/member");
var ActivityModel = require("../../model/activity");
var logger = require("../../logger");
var async = require("async");

exports.add = function(req,res,next){
	var memberId = req.body.memberId;
	var activityId = req.body.activityId;


	if(!memberId){
		return res.send(403,"memberId required")
	}

	if(!activityId){
		return res.send(403,"activityId required")
	}

	var clubId = null;
	var memberName = null;
	var memberGetError = null;
	var insertData = null;
	var tasks = [];

	tasks.push(function getActivity(done){
		async.parallel([
			function(done){
				CheckinModel.isMemberChecked(memberId, activityId, done)
			},
			function(done){
				ActivityModel.find({
					id:activityId
				},function(err,result){
					if(err){return done(err);}
					if(!result[0]){return done("activity not found")}
					done(null, result[0]);
				});
			}
		], function(err, results){
			logger.info("resultsssss", results);
			if(err){return done(err);}
			if(results[0] == false){ done ("checked");}
			clubId = results[1];
			done(null);
		});
	});

	tasks.push(function getMemberName(done){
		MemberModel.getNameById(memberId,function(err,data){
			if(err){
				memberGetError = err  == "ETIMEDOUT" ? "兽老师超时啦" : "兽老师坏掉啦";
			}

			memberName = data;
			done(null);
		}); // request junyi's api
	});

	tasks.push(function addCheckin(done){
		insertData = {
			activityId:activityId,
			clubId:clubId,
			memberId:memberId,
			memberName:memberName,
			addDate:new Date()
		};
		CheckinModel.add(insertData, done);
	});

	async.series(tasks, function(err, info){
		if(err){
			if(err === "checked"){
				return res.send(403,"签过到了");
			}else if(err == "memberId not found"){
				return res.send(403,"查无此人");
			}else{
				return res.send(500,err);
			}
		}

		if(memberGetError){
			return res.send(500, memberGetError);
		}

		return res.send(200, insertData);
	});
}

exports.list = function(req,res,next){

}