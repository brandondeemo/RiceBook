const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    sessionKey: {
        type: String,
        required: [true, 'SessionKey is required']
    },
    username: {
        type: String,
        required: [true, 'Username is required']
    }
});

module.exports = sessionSchema;