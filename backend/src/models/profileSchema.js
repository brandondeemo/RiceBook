const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    headline: {
        type: String,
        required: [false],
        default: "I'm learning JavaScript!"
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    zipcode: {
        type: Number,
        required: [true, 'Zipcode is required']
    },
    dob: {
        type: Date,
        required: [true, 'DoB is required']
    },
    avatar: {
        type: String,
        required: [false],
        default: "https://res.cloudinary.com/hmr4i8nuj/image/upload/v1638487498/C564D183-A035-4607-86AF-E0FAC649E80F_n8ayk7.jpg"
    },
    followedUsers: {
        type: Array,
        required: [false]
    }
});

module.exports = profileSchema;