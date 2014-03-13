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

	tasks.push(function getActivity(alldone){
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
			if(err){return alldone(err);}
			if(results[0]){ return alldone ("checked");}
			clubId = results[1].clubId;
			alldone(null);
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

exports.batchadd = function(req,res){
	var members = req.body.members;
	var activityId = req.body.activityId;
	var clubId = null;
	var tasks = [];
	var newCheckins = [];
	try{
		members = JSON.parse(members);
	}catch(e){
		members = [];
	}

	tasks.push(function validateActivity(done){
		ActivityModel.find({
			id:activityId
		},function(err,result){
			if(err){return done(err);}
			if(!result[0]){return done("activity not found");}
			clubId = result[0].clubId;
			done(null);
		});
	});

	members.forEach(function(member){
		tasks.push(function checkinMember(done){
			CheckinModel.isMemberChecked(member.id, activityId, function(err, checked){
				if(err){return done(err);}
				if(checked){return done(null);}
				var insertData = {
					activityId:activityId,
					clubId:clubId,
					memberId:member.id,
					memberName:member.name,
					addDate:new Date()
				};
				CheckinModel.add(insertData, function(err){
					if(err){return done(err);}
					newCheckins.push(insertData);
					done(null);
				});
			});
		});
	});

	async.series(tasks,function(err){
		if(err){return res.send(500,err);}
		res.send(200,newCheckins);
	});
}

exports.list = function(req,res,next){

}