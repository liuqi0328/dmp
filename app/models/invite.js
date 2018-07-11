// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var inviteSchema = mongoose.Schema({
    email            : String,
    permissions      : [String],
    clientId         : Number,
    uuid             : String,
    timeCreated      : Number,
    inviterId        : String,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Invite', inviteSchema);