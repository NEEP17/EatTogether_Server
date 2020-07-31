var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var foodSchema = new Schema({
    foodName: String,
    image : String
});

module.exports = mongoose.model('food', foodSchema);

