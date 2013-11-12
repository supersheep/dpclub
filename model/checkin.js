var Model = require("./base");
var CheckinModel = new Model("checkin");

module.exports = CheckinModel;

CheckinModel.add = function(club,member,callback){
	this.db.query("insert into " + this.table + " set ?",{
		clubId:club,
		memberId:member,
		addDate:new Date()
	},function(err,results){
        if(err){
            return callback(err);
        }else{
            callback(null,results[0]);
        }
    });
}