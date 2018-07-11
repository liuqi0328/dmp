// load the things we need
let mongoose = require('mongoose');
// var autoIncrement = require('mongoose-auto-increment');

// define the schema for our user model
let clientSchema = mongoose.Schema({
    id: Number, // Increase by one, starting from 0.
    name: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
    last_updated: {
        type: Date,
        default: Date.now(),
    },
});

// create the model for users and expose it to our app
// clientSchema.plugin(autoIncrement.plugin, 'client');
module.exports = mongoose.model('client', clientSchema);
