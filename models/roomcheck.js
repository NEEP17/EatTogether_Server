module.exports = (mongoose) => {
    return mongoose.model('roomcheck', 
    mongoose.Schema({
        roomID: String,
        count: Number,
        foodList: Array
    }));
};
