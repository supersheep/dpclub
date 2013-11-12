var CheckinModel = require("../../model/checkin");
var ClubModel = require("../../model/club");

exports.getlist = function(req,res){
	ClubModel.getAll(function(err,list){
		if(err){return res.send(500,err);}
		res.send(200,list);
	});
}

exports.checkin_history = function(req,res){
	var clubid = req.params.id;

	CheckinModel.getHistoryByClubId(clubid,function(err,list){
		if(err){return res.send(500,err);}
		res.send(200,list);
	});
}