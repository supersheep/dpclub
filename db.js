var mysql = require("mysql");
var config = require("./config");

exports.connection = mysql.createConnection(config.db);