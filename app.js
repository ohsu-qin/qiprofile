/*
* The Imaging Profile Express application.
*/

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.set('port', 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Handle Errors gracefully
app.use(function(err, req, res, next) {
	if(!err) return next();
	console.log(err.stack);
	res.json({error: true});
});

// Main App Page
app.get('/', routes.index);

// API Routes
// app.get('/polls/polls', routes.list);
// app.get('/polls/:id', routes.poll);
// app.post('/polls', routes.create);
// app.post('/vote', routes.vote);
// 
// io.sockets.on('connection', routes.vote);

server.listen(app.get('port'), function(){
  console.log('The Imaging Profile server is listening on port ' + app.get('port'));
});
