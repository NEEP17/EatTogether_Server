module.exports = (mongoose) => {
    return mongoose.model('food', 
    mongoose.Schema({
        name: String,
        image : String
    }));
};
