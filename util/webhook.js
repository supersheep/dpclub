var request = require("request");
var ClubModel = require("../model/club");


exports.trigger = function(clubId,action,data){
	ClubModel.one({id:clubId},function(err,club){
		if(!err && club && club.hook){
			request.post(club.hook,{
				form:{
					action:action,
					data:data
				}
			});
		}
	});
}