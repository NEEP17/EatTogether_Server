'use strict';

const mongoose    = require('mongoose');
const env = process.env.NODE_ENV || 'development';
const db = {};
const { MONGO_ID , MONGO_PASSWORD } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/neep?authSource=admin`;
// [ CONFIGURE mongoose ]
// CONNECT TO MONGODB SERVER
var mongo = mongoose.connection;
mongo.on('error', console.error.bind(console, 'connection error:'));
mongo.once('open', function callback () {
    console.log("mongo db connection OK.");
});
mongoose.connect(MONGO_URL);

db.mongoose = mongoose;
db.Room = require('./room')(db.mongoose);
db.RoomCheck = require('./roomcheck')(db.mongoose);
db.Food = require('./food')(db.mongoose);

module.exports = db;



