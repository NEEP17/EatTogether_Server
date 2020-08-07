var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    roomID: String,
    deviceNum : String, 
    good:String, 
    bad:String,
    pred: [Number],
    flag: Boolean
});

module.exports = mongoose.model('room', roomSchema);