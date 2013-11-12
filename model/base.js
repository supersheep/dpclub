var db = require("../db");


var Model = function(table){
	this.table = table;
	this.db = db.connection;
};


Model.prototype.getById = function(id,cb){
	this.db.query("select * from " + this.table + " where id=?",[id],function(err,rows){
		if(err){
			return cb(err);
		}else{
			cb(null,rows[0]);
		}
	});
};


Model.prototype.getAll = function(cb){
	this.db.query("select * from " + this.table, function(err,rows){
		if(err){
			return cb(err);
		}else{
			cb(null,rows);
		}
	});
};

module.exports = Model;