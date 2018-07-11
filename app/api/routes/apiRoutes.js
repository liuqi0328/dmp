'use strict';

// const rp = require('request-promise');
const messageControllers = require('../controllers/messageControllers');

const baseApiUrl = '/api/v1';
const reportingUrl = `${baseApiUrl}/reporting`;

module.exports = (app) => {
    app.route('/api/test')
        .get((req, res) => {
            res.sendStatus(200);
        });

    app.route(`${baseApiUrl}/messages`)
        .post(messageControllers.sendMessage);

    app.route(`${reportingUrl}/interval/:time_interval`);

    app.route(`${reportingUrl}/dimensions`)


};
