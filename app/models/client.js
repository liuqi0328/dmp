// load the things we need
let mongoose = require('mongoose');
// var autoIncrement = require('mongoose-auto-increment');

// define the schema for our user model
let clientSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
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

clientSchema.statics.getNextId = async () => {
    let clients = await mongoose.model('client', clientSchema).find({});
    if (clients.length < 1) return 1;
    let ids = clients.map(x => x.id);
    return Math.max(...ids) + 1;
};

// create the model for users and expose it to our app
// clientSchema.plugin(autoIncrement.plugin, 'client');
module.exports = mongoose.model('client', clientSchema);
