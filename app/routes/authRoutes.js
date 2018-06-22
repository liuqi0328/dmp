'use strict';

const Application = require('../models/application');
const AccessToken = require('../models/acessToken');

module.exports = (app) => {
    app.route('/auth/token')
        .post(async (req, res) => {
            console.log('req: ', req);
            let headers = req.headers;
            console.log(headers);
            let decoded =
                Buffer.from(headers.authorization, 'base64').toString();
            let arr = decoded.split(':');
            let options = {
                client_id: arr[0],
                client_secret: arr[1],
            };
            let application;
            try {
                application = await Application.findOne(options);
            } catch (err) {
                console.log(err, err.stack);
                res.sendStatus(500);
            }
            if (!application) {
                res.sendStatus(401);
            } else {
                let accessToken = await AccessToken.create({});
                let response = {
                    token_type: 'bearer',
                    access_token: accessToken.access_token,
                    expires_in: accessToken.expires_in,
                    refresh_token: accessToken.refresh_token,
                };
                res.json(response);
            }
        });
};
