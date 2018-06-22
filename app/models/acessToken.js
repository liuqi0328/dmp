'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let accessTokenSchema = new Schema({
    access_token: {
        type: String,
        default: '',
        unique: true,
    },
    refresh_token: {
        type: String,
        default: '',
        unique: true,
    },
    expires_in: {
        type: Number,
        default: 300,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    last_updated: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('accessToken', accessTokenSchema);
