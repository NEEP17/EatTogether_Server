var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomcheckSchema = new Schema({
    roomID: String,
    count: Number
});

module.exports = mongoose.model('roomcheck', roomcheckSchema);
