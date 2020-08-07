module.exports = (mongoose) => {
    return mongoose.model('food', 
    mongoose.Schema({
        foodName: String,
        image : String
    }));
};