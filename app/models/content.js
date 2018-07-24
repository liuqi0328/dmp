'use strict';

let mongoose = require('mongoose');

let contentSchema = mongoose.Schema({
    content_tag_id: {
        type: String,
        required: true,
    },
    content_location: {
        type: String,
        required: true,
        unique: true,
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

module.exports = mongoose.model('content', contentSchema);
