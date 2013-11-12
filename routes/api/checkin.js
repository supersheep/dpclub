var CheckinModel = require("../../model/checkin");

exports.add = function(req,res,next){
	var memberid = req.body.memberid;
	var clubid = req.body.clubid;

	CheckinModel.add(clubid,memberid,function(err){
		if(err){return res.send(500,err);}
		console.log("added");
	});

}