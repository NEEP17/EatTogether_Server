'use strict';

const mongoose    = require('mongoose');
const env = process.env.NODE_ENV || 'development';
const db = {};

// [ CONFIGURE mongoose ]
// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("mongo db connection OK.");
});
mongoose.connect('mongodb://neep:NeepWhat!@localhost:27017/neep?authSource=admin');

db.mongoose = mongoose;
db.Conf_room = require('./room')(db.mongoose);

module.exports = db;

