'use strict';

let mongoose = require('mongoose');

let contentTagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    client_id: {
        type: String,
        required: true,
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

module.exports = mongoose.model('contentTag', contentTagSchema);
