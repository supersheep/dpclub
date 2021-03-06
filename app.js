
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var expressValidator = require('express-validator')

var checkin = require("./routes/api/checkin");
var club = require("./routes/api/club");
var multiFormat = require("./middleware/multiFormat");
var activity = require("./routes/api/activity");

var home = require("./routes/home");
var mailer = require("./util/mailer");

var app = express();

process.on("uncaughtException",function(e){
    console.error(e);
    var config = {
        to:"jiayi.xu@dianping.com",
        subject:"DPClub Error",
        html: (new Date()).toString() + " <br />" + e.toString() + "<br />" + (e.stack || "")
    };
    mailer.send(config,function(){});
});

// all environments
app.set('port', process.env.PORT || 3011);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.compress());
app.use(express.logger( process.env.NODE_ENV == "product" ? 'default' : 'dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public'),{
    maxAge : 24 * 60 * 60 * 1000
}));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', home);
app.get('/club/:id/activity', home);
app.get('/activity/create', home);
app.get('/activity/:id', home);
app.get('/activity/:id/qr', home);

app.get('/api/club', multiFormat, club.list);
app.get('/api/club/:id/activity:format?', multiFormat, club.activity);
app.get('/api/club/:id/members:format?', multiFormat, club.members);
app.get('/api/club/:id/checkins:format?', multiFormat, club.checkins);

app.post('/api/activity/create', activity.create);
app.get('/api/activity/:id', multiFormat, activity.one);
app.delete('/api/activity/:id', activity.delete);
app.get('/api/activity/:id/checkin:format?', multiFormat, activity.checkins);

app.post('/api/checkin/add', checkin.add);
app.post('/api/checkin/batchadd', checkin.batchadd);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
