var db = require("../db");


var Model = function(table){
	this.table = table;
	this.db = db.connection;
};


Model.prototype.one = function(where,cb){
	this.find(where,function(err,rows){
		if(err){
			return cb(err);
		}else{
			cb(null,rows[0]);
		}
	});
};

Model.prototype.find = function(where,cb){
	this.db.query("select * from " + this.table + " where ?", where, function(err,rows){
		if(err){
			return cb(err);
		}else{
			cb(null,rows);
		}
	});
}

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