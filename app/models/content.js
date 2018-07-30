'use strict';

let mongoose = require('mongoose');

let contentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    client_id: {
        type: String,
        required: true,
    },
    content_location: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['audio', 'video', 'image'],
    },
    isrc: {
        audio: String,
        video: String,
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

module.exports = mongoose.model('content', contentSchema);
