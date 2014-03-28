var CheckinModel = require("../../model/checkin");
var ClubModel = require("../../model/club");
var ActivityModel = require("../../model/activity");
var db = require("../../db");

exports.list = function(req,res){
    ClubModel.getAll(function(err,list){
        if(err){return res.send(500,err);}
        res.formatSend(200,list);
    });
}

exports.activity = function(req,res){
    var clubid = req.params.id;
    ActivityModel.getHistoryByClubId(clubid,function(err,list){
        if(err){return res.send(500,err);}
        res.formatSend(200,list);
    });
}

exports.members = function(req,res){
    var clubid = req.params.id;
    ClubModel.distinctMember(clubid, function(err, members){
        if(err){return res.send(500,err);}
        res.formatSend(200, members);
    });
}

exports.checkins = function(req,res){
    var clubid = req.params.id;
    ClubModel.checkins(clubid, function(err, list){
        if(err){return res.send(500,err);}
        res.formatSend(200, list);
    });
}