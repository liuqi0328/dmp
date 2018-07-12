'use strict';

// const rp = require('request-promise');
const messageControllers = require('../controllers/messageControllers');
const reportingControllers = require('../controllers/reportingControllers');

const baseApiUrl = '/api/v1';

let VoiceApp = require('../../models/voiceApp');
let User = require('../../models/user');

module.exports = (app) => {
    app.route('/api/test')
        .get((req, res) => {
            console.log('test: ', res.locals.client);
            console.log(res.locals.client instanceof VoiceApp);
            if (!(res.locals.client instanceof User)) return res.sendStatus(401);
            res.sendStatus(200);
        });

    app.route(`${baseApiUrl}/messages`)
        .post(messageControllers.sendMessage);

    app.route(`${baseApiUrl}/reporting`)
        .get(reportingControllers.allMessages);

    app.route(`${baseApiUrl}/reporting/:time_interval`)
        .get(reportingControllers.timeInterval);
};
