'use strict';

const rp = require('request-promise');
const aerospikeServer = 'http://ec2-52-207-188-234.compute-1.amazonaws.com:8000/';

module.exports = (app) => {
    app.route('/api/test')
        .get((req, res) => {
            res.sendStatus(200);
        });

    app.route('/api/v1/messages')
        .post(async (req, res) => {
            console.log('body: ', req.body);

            let options = {
                method: 'POST',
                uri: 'http://localhost:8000/',
                json: true,
                body: req.body,
                headers: {
                    'User-Agent': 'BeyondVoiceSDK',
                },
            };
            try {
                let data = await rp(options);
                console.log('send to api success!', data);
                res.send({ message: 'success' });
            } catch (err) {
                console.log('send to api failure!');
                console.error(err);
                res.send({message: `failed: ${err.message}`});
            }
        });
};
