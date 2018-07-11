// load the things we need
var mongoose = require('mongoose');
// var autoIncrement = require('mongoose-auto-increment');

// define the schema for our user model
var clientSchema = mongoose.Schema({
    id      	: Number, // Increase by one, starting from 0.
    name    	: String,
    timeCreated	: Number
});

// create the model for users and expose it to our app
// clientSchema.plugin(autoIncrement.plugin, 'client');
module.exports = mongoose.model('client', clientSchema);