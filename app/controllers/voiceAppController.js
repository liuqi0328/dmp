'use strict';

const User = require('../models/user');

exports.getAllAlexaSkills = async (req, res) => {
    console.log('get skills...');
    console.log(req.session);
    console.log(req.user);

    // let session = req.session;
    // let user = await User.findById(session.passport.user);
    // console.log(user);

    // let clientId = user.client_id;

    res.sendStatus(200);
};
