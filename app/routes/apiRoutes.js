'use strict';

const {Request, Response} = require('oauth2-server');

// console.log(Request, Response);

module.exports = (app) => {
    app.route('/api/test')
        .get((req, res) => {
            let request = new Request(req);
            let response = new Response(res);
            app.oauth.authenticate(request, response)
                .then((token) => {
                    console.log('granted! ', token);
                    res.json({message: 'granted'});
                })
                .catch((err) => {
                    console.log('not granted');
                    res.sendStatus(400);
                });
        });
};
