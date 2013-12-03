var CheckinModel = require("../../model/checkin");
var ClubModel = require("../../model/club");
var ActivityModel = require("../../model/activity");

exports.one = function(req,res){
	ActivityModel.one({
		id:req.params.id
	},function(err,activity){
		if(err){return res.send(500,err);}
		if(!activity){return res.send(404,"not found");}
		
		res.send(200,activity);
	});
}


exports.create = function(req,res){
	var data = req.body;
	ActivityModel.create({
		club:data.club,
        title:data.title,
        time:data.time
	},function(err,result){
		if(err){return res.send(500,err);}
		res.send(200,result);
	});
}

exports.checkins = function(req,res){
	var activityId = req.params.id;

	CheckinModel.find({
		activityId:activityId
	},function(err,list){
		if(err){return res.send(500,err);}
		res.send(200,list);
	});
}