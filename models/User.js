const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
    googleID: {
        type: String,
    },
    displayName: {
        type: String,

    },
    firstName: {
        type: String,

    },
    lastName: {
        type: String,
    },
    image: {
        type: String,
    },
    username: {
        type: String,
        unique: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('User', UserSchema)