var winston = require("winston");

var logger = winston;

var _old_log = logger.log;

logger.log = function(type, msg){
    _old_log(type, new Date() + " " + msg);
}

module.exports = logger;