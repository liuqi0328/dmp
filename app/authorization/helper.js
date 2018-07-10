'use strict';

const OauthServer = require("oauth2-server");
const AccessToken = require('./acessToken');
const dbDuplicateErrMsg = 'E11000 duplicate key error collection';

module.exports = (app) => {
    return {
        token: async (req, res) => {
            let request = new OauthServer.Request(req);
            let response = new OauthServer.Response(res);
            request.body = req.query;
            app.oauth.token(request, response)
                .then((token) => {
                    let data = {
                        access_token: token.accessToken,
                        expires_at: token.accessTokenExpiresAt,
                    };
                    res.json(data);
                })
                .catch((err) => {
                    console.log(err.message);
                    // if (err.message.startsWith(dbDuplicateErrMsg)) {
                    //     let authorizationHeader = req.get('Authorization');
                    //     console.log(authorizationHeader);
                    //     let authorization = authorizationHeader.split(' ');
                    //     let encoded = authorization[1];
                    //     let decoded = new Buffer.from(encoded, 'base64').toString();
                    //     console.log(decoded);
                    //     let client = decoded.split(':');
                    //     console.log(client);
                    //     // let accessToken = await AccessToken
                    // }
                    res.json(
                        { message: err.message }
                    );
                });
        },
        authenticate: async (req, res, next) => {
            let authorizationHeader = req.get('Authorization');

            if (!authorizationHeader) return res.sendStatus(401);

            let authorization = authorizationHeader.split(' ');
            let token = authorization[1];

            if (!token) return res.sendStatus(401);

            console.log(token);

            // let accessToken = await AccessToken.findOne({

            // })

            // let request = new OauthServer.Request(req);
            // let response = new OauthServer.Response(res);

            // // console.trace();

            // app.oauth.authenticate(request, response)
            //     .then((token) => {
            //         console.log('middleware token: ', token);

            //         res.locals.oauth = { token: token };
            //         next();
            //     })
            //     .catch((err) => {
            //         // handle error condition
            //         console.log(err);
            //         return res.sendStatus(401);
            //     });
        },
    };
};
