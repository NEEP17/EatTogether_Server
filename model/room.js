var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    roomID: String,
    device: [{ deviceNum : String, good:String, bad:String, 
	pred:[{foodNum1:Number,foodNum2:Number,foodNum3:Number,
		foodNum4:Number,foodNum5:Number,foodNum6:Number,
		foodNum7:Number,foodNum8:Number,foodNum9:Number,foodNum10:Number
	      }] 	
     }]
});

module.exports = mongoose.model('room', roomSchema);

