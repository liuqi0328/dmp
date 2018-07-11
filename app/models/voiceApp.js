// load the things we need
var mongoose = require('mongoose');

// define the schema for our voice application model
var voiceAppSchema = mongoose.Schema({

    name            : String,
    secret          : String,
    scope           : String,
    ownerId         : Number
});


// create the model for users and expose it to our app
module.exports = mongoose.model('voiceApp', voiceAppSchema);