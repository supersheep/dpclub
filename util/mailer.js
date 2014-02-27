var mailer = require("nodemailer");
var config = require("../config");

var transport = mailer.createTransport("QQex",{
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
            console.error("sendmail - error:",err);
        }else{
            console.log("send - success:",responses);
        }

        callback(err, responses);
    });
};