module.exports = (mongoose) => {
    return mongoose.model('room', 
    mongoose.Schema({
        roomID: String,
        deviceNum : String, 
        good:String, 
        bad:String,
        pred: [parseFloat(Number)],
        flag: Boolean
    }));
};

