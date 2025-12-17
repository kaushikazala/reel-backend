const mongoose = require('mongoose');
const like = require('./likes.model');


const foodSchema = new mongoose.Schema({
    name: {
        type: String,   
        required: true
    },
    video:{
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    // Store price as integer cents to avoid floating point issues (e.g. $9.99 => 999)
    priceCents: {
        type: Number,
        min: 0,
        default: 0
    },
    foodPartner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodPartner',
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    savesCount: {
        type: Number,   
        default: 0
    }
}, { timestamps: true
});

const foodModel = mongoose.model("Food", foodSchema);

module.exports = foodModel;
