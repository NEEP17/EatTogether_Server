const model = require('../../../models');

exports.room = async (req,res, next) => {
    var roomID;
    var deviceNum;
    var good;
    var bad;
    var pred;
    var flag;
    
    try{
        await model.Room.find({}).then((results) => {
            if(results) console.log("rooms"+results);
        }).catch((err) => {
            console.log(err);
        });
    } catch (Error) {
        console.log(Error);
    }
};
