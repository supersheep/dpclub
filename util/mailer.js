var mailer = require("nodemailer");
var config = require("../config");
var logger = require("../logger");

var transport = mailer.createTransport(config.mailer.provider,{
    auth:{
        user: config.mailer.user,
        pass: config.mailer.password
    }
});

exports.send = function(config,callback){
    if(!config.subject){return callback("no subject");}
    if(!config.html){return callback("no html");}

    transport.sendMail({
        from:"spudhsu <403391676@qq.com>",
        to: config.to,
        subject:config.subject,
        html:config.html
    },function(err,responses){
        if(err){
            logger.error("sendmail - error:",err);
        }else{
            logger.info("send - success:",responses);
        }

        callback(err, responses);
    });
};