'use strict';

const mongoose = require('mongoose');
const uniqid = require('uniqid');
const Schema = mongoose.Schema;

// let User = require('../../models/user');
// let VoiceApp = require('../../models/voiceApp');

let apiKeySchema = new Schema({
    api_key: {
        type: String,
        default: uniqid(),
    },
    owner_type: {
        type: String,
        enum: ['user', 'app'],
    },
    owner_id: {
        type: String,
        required: true,
    },
    scope: {
        type: [String],
        default: ['public'],
    },
    active: {
        type: Boolean,
        default: true,
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

apiKeySchema.statics.getActiveKeys = function(cb) {
    return this.find({active: true}, cb);
};

module.exports = mongoose.model('apiKey', apiKeySchema);
