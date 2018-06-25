'use strict';

const uniqid = require('uniqid');
const Application = require('../models/application');
const AccessToken = require('../models/acessToken');

module.exports = (app) => {
    app.post('/auth/token', async (req, res) => {
        console.log('req: ', req);
        let headers = req.headers;
        let body = req.body;

        if (body.refresh_token) {
            AccessToken.findOneAndUpdate(
                {
                    access_token: headers.authorization,
                    refresh_token: body.refresh_token,
                },
                {access_token: uniqid()},
                {new: true},
                (err, doc) => {
                    if (err) {
                        console.log(err, err.stack);
                        res.sendStatus(401);
                    } else {
                        let newToken = {
                            token_type: 'bearer',
                            access_token: doc.access_token,
                            expires_in: doc.expires_in,
                            refresh_token: doc.refresh_token,
                        };
                        res.json(newToken);
                    }
                });
        } else {
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
                let accessToken = await AccessToken.create({
                    access_token: uniqid(),
                    refresh_token: uniqid(),
                });
                let response = {
                    token_type: 'bearer',
                    access_token: accessToken.access_token,
                    expires_in: accessToken.expires_in,
                    refresh_token: accessToken.refresh_token,
                };
                res.json(response);
            }
        }
    });
};
