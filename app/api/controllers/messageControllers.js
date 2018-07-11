'use strict';

const rp = require("request-promise");

const VoiceApp = require('../../models/voiceApp');
const aerospikeServer = 'http://ec2-52-207-188-234.compute-1.amazonaws.com:8000/';

exports.sendMessage = async (req, res) => {
    console.log('body: ', req.body);
    console.log(res.locals);

    let voiceApp = res.locals.client;

    let platform = voiceApp.platform;
    let accountId = voiceApp.owner;
    let appId = voiceApp._id;

    let data = req.body;
    let dmpData = {
        platform: platform,
        account_id: accountId,
        app_id: appId,
    };
    data.dmp = dmpData;

    let options = {
        method: 'POST',
        uri: 'http://localhost:8000/',
        json: true,
        body: data,
        headers: {
            'User-Agent': 'BeyondVoiceSDK',
        },
    };
    try {
        let result = await rp(options);
        console.log('send to api success!', result);
        res.json({message: 'success'});
    } catch (err) {
        console.log('send to api failure!');
        console.error(err);
        res.json({message: `failed: ${err.message}`});
    }
};
