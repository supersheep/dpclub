
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var checkin = require("./routes/api/checkin");
var club = require("./routes/api/club");
var home = require("./routes/home");

var app = express();

// all environments
app.set('port', process.env.PORT || 3011);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', home);

app.post('/api/checkin', checkin.add);
app.get('/api/club', club.getlist);
app.get('/api/club/:id', club.checkin_history);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
