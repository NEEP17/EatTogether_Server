const model = require('../../../models');

exports.room = async (req,res,next) => {
    var roomID;
    var deviceNum;
    var good;
    var bad;
    var pred;
    var flag;
    
    await model.room.find().then((results) => {
        console.log("rooms"+results);
    });

}