var mongoose = require('mongoose');

mongoose.connect('mongodb://13.125.224.168:27017/neep');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("mongo db connection OK.");
});

