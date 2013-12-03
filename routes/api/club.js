var CheckinModel = require("../../model/checkin");
var ClubModel = require("../../model/club");
var ActivityModel = require("../../model/activity");

exports.list = function(req,res){
    ClubModel.getAll(function(err,list){
        if(err){return res.send(500,err);}
        res.send(200,list);
    });
}

exports.activity = function(req,res){
    var clubid = req.params.id;
    ActivityModel.getHistoryByClubId(clubid,function(err,list){
        if(err){return res.send(500,err);}
         res.send(200,list);
    });
}