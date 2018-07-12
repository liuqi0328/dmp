'use strict';

let VoiceApp = require('../models/voiceApp');
let User = require('../models/user');
let ApiKey = require('./models/apiKey');

exports.authenticate = async (req, res, next) => {
    console.log(req.query);
    let apiKey = req.query.api_key;
    console.log(apiKey);

    let keyInfo;
    try {
        keyInfo = await ApiKey.findOne({ api_key: apiKey });
        console.log('authentication api key: ', keyInfo);
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }

    if (!keyInfo) return res.sendStatus(401);

    let client = await getApiKeyOwner(apiKey);
    console.log('authentication client: ', client);

    res.locals.client = client;
    next();
};

/**
 * Creates and saves a sample voice application to the database.
 *
 * sampleApp = {
 *     name: 'testName',
 *     client_id: 'testOwner',
 *     platform: 'alexa',
 *     created_at: {current time},
 *     updated_at: {current_time}
 * }
 * @return {void}
 */
exports.loadSampleApp = () => {
    return new Promise((resolve, reject) => {
        VoiceApp.create({
            name: 'testName',
            client_id: 'testOwner',
            platform: 'alexa',
        }, (err, voiceApp) => {
            if (err) {
                console.log(err);
                reject();
            }
            console.log('app created: ', voiceApp);
            resolve();
        });
    });
};

/**
 * Given an API Key, returns the owner of the API Key.
 *
 * @param  {string} apiKey
 * @return {object}        Returns either a User or a VoiceApp
 */
let getApiKeyOwner = async (apiKey) => {
    let keyInfo;
    try {
        keyInfo = await ApiKey.findOne({ api_key: apiKey });
    } catch (err) {
        console.error(err);
        return;
    }

    let owner;
    if (keyInfo.owner_type == 'app') {
        try {
            owner = await VoiceApp.findOne({ _id: keyInfo.owner_id });
        } catch (err) {
            console.error(err);
            return;
        }
    } else {
        try {
            owner = await User.findOne({ _id: keyInfo.owner_id });
        } catch (err) {
            console.error(err);
            return;
        }
    }
    return owner;
};
