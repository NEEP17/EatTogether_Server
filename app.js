var mongoose = require('mongoose');
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8000;

var Food = require('./models/food');
var Room = require('./models/room');
var RoomCheck = require('./models/roomcheck');
var router = require('./routes')(app, Room, RoomCheck, Food);

// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("Express server has started on port " + port)
});

// [ CONFIGURE mongoose ]
// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("mongo db connection OK.");
});

mongoose.connect('mongodb://neep:NeepWhat!@localhost:27017/neep?authSource=admin');
// DEFINE MODEL
//var Room = require('./model/room');
//var router = require('./routes')(app, Room);
