'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv4 = require('uuid/v4'); // uuid version 4 (random)

let applicationSchema = new Schema({
    app_id: {
        type: String,
        required: true,
        unique: true,
    },
    client_id: {
        type: String,
        default: uuidv4(),
        unique: true,
    },
    client_secret: {
        type: String,
        default: uuidv4(),
        unique: true,
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

module.exports = mongoose.model('application', applicationSchema);
