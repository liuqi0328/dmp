'use strict';

// const rp = require('request-promise');
const messageControllers = require('../controllers/messageControllers');
const reportingControllers = require('../controllers/reportingControllers');
const cmsController = require('../controllers/cmsController');

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

    // MESSAGE API ROUTES
    app.post(`${baseApiUrl}/messages`, messageControllers.sendMessage);

    // REPORTING API ROUTES
    app.get(`${baseApiUrl}/reporting`, reportingControllers.allMessages);
    app.get(`${baseApiUrl}/reporting/:time_interval`,
            reportingControllers.timeInterval);

    // CMS API ROUTES
    app.get(`${baseApiUrl}/cms`, cmsController.getContent);
};
