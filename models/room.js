var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    roomID: String,
    deviceNum : String, 
    good:String, 
    bad:String,
    pred: [Number],
    flag: String
});

module.exports = mongoose.model('room', roomSchema);

