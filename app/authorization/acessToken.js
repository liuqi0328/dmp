'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let voiceAppSchema = require('../models/voiceApp');

let accessTokenSchema = new Schema({
    accessToken: String,
    expires: Date,
    clientId: String,
    user: Schema.Types.Mixed,
    created_at: {
        type: Date,
        default: Date.now(),
    },
    last_updated: {
        type: Date,
        default: Date.now(),
    },
});

accessTokenSchema.index({expires: 1}, {expireAfterSeconds: 0});

module.exports = mongoose.model('accessToken', accessTokenSchema);
