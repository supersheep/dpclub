var db = require("../db");
var logger = require("../logger");

var Model = function(table){
	this.table = table;
	this.__defineGetter__('db', function(){
	    return db.getConnection();
	});
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
	var order = where.$order == "asc" ? "asc" : "desc";
	var by = where.$by || "id";

	for(key in where){
		if(key[0] == "$"){
			delete where[key];
		}
	}

	var query = this.db.query("select * from ?? where ? order by ?? " + order , [this.table, where, by], function(err,rows){
		if(err){
			return cb(err);
		}else{
			cb(null,rows);
		}
	});
	logger.info(query.sql);
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