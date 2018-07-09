// load the things we need
const mongoose = require('mongoose');
const Application = require('../authorization/application');

// define the schema for our voice application model
let voiceAppSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
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

/*
 * Create Application (`client_id` and `client_secret`) after creating a voice
 * application.
 */
voiceAppSchema.post('save', async (doc) => {
    console.log('%s has been saved', doc._id);
    let appId = doc._id;
    let application = await Application.create({app_id: appId});
    console.log('application created', application);
});

// create the model for users and expose it to our app
module.exports = mongoose.model('voiceApp', voiceAppSchema);
