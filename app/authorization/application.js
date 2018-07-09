'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let applicationSchema = new Schema({
    app_id: String,
    clientId: String,
    clientSecret: String,
    grants: [String],
    created_at: {
        type: Date,
        default: Date.now(),
    },
    last_updated: {
        type: Date,
        default: Date.now(),
    },
});

applicationSchema.post('save', async (doc) => {
    console.log('%s has been saved: ', doc);
});

module.exports = mongoose.model('application', applicationSchema);
