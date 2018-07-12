'use strict';

// load the things we need
const mongoose = require('mongoose');
let ApiKey = require('../authorization/models/apiKey');

// define the schema for our voice application model
let voiceAppSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    client_id: {
        type: String,
        required: true,
    },
    platform: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
    last_updated: {
        type: Date,
        default: Date.now(),
    },
});

/*
 * Create API Key for the application after creating a voice
 * application.
 */
voiceAppSchema.post('save', async (doc) => {
    console.log('%s has been saved', doc._id);
    let appId = doc._id;
    let apiKey = await ApiKey.create({
        owner_type: 'app',
        owner_id: appId,
    });
    console.log('api key created', apiKey);
});

// create the model for users and expose it to our app
module.exports = mongoose.model('voiceApp', voiceAppSchema);
