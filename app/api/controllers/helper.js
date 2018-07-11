'use strict';

const rp = require('request-promise');
const VoiceApp = require('../../models/voiceApp');

let getDataFromAerospike = async (clientId, interval) => {
    let options = {
        method: 'GET',
        uri: `http://localhost:8000/clients/${clientId}/${interval}`,
        json: true,
        headers: {
            'User-Agent': 'BeyondVoiceSDK',
        },
    };
    try {
        let data = rp(options);
        return data;
    } catch (err) {
        console.log('get client message data from aerospike error...!');
        console.error(err);
        return [];
    }
};

let filterDimensions = (data, dimensions) => {
    let result = data;
    for (let key in dimensions) {
        console.log(key, dimensions[key]);
        if (key == 'api_key') continue;
        result = filter(data, key, dimensions[key]);
    }
    return result;
};

let filter = async (data, key, value) => {
    let result = data;
    switch (key) {
        case 'developer_id':
        case 'developer_name':
        case 'app_id':
            result = data.filter(message => message.bins.data.dmp.app_id == value);
            break;
        case 'app_name': {
            let voiceApp = await VoiceApp.findOne({ name: value });
            if (voiceApp) {
                result = data.filter(message => message.bins.data.dmp.app_id == voiceApp._id);
            }
            break;
        }
        case 'intent':
        case 'intent_attribute':
        case 'user_id':
            console.log('user_id filter');
            result = data.filter(message => {
                console.log(message.bins.data.event.context.System.user.userId == value);
                console.log(value);
                return message.bins.data.event.context.System.user.userId == value;
            });
            break;
        case 'device_id':
        case 'session_id':
            result = data.filter(message => message.bins.data.event.app_id == value);
            break;
        case 'application_type':
        case 'application_vertical':
        case 'session_length':
    }
    console.log('filter result: ', result);
    return result;
};

module.exports = {
    getDataFromAerospike: getDataFromAerospike,
    filterDimensions: filterDimensions,
};
