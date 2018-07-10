'use strict';

let VoiceApp = require('../models/voiceApp');

exports.authenticate = async (req, res, next) => {
    console.log(req.query);
    let apiKey = req.query.api_key;
    console.log(apiKey);

    let voiceApp;
    try {
        voiceApp = await VoiceApp.findOne({api_key: apiKey});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
    console.log(voiceApp);
    if (!voiceApp) return res.sendStatus(401);
    next();
};

exports.loadSampleApp = () => {
    return new Promise((resolve, reject) => {
        VoiceApp.create({
            name: 'testName',
            owner: 'testOwner',
        }, (err, voiceApp) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            console.log('app created: ', voiceApp);
            resolve(voiceApp);
        });
    });
};
