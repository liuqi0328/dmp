'use strict';

const rp = require('request-promise');
const VoiceApp = require('../../models/voiceApp');

/**
 * Executes a http request to the Aerospike DB to fetch the message data
 * associated with the provided client_id.
 *
 * @param  {string} clientId Client_id from the API Key
 * @param  {string} interval Interval param from the API endpoint
 * @return {array}           Returns an array of data for given client_id
 *                           from Aerospike
 */
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

/**
 * Returns an array of filtered message data depending on the dimensions.
 *
 * Possible dimensions:
 *     developer_id : string
 *     app_id : string
 *     app_name : string
 *     developer_name : string
 *     intent* : string
 *     intent_attribute* : string
 *     user_id : string
 *     device_id : string
 *     session_id : string
 *     application_type : string
 *     application_vertical : string
 *     session_length : number
 *
 * @param  {array}                    data       Array of initial data from
 *                                               Aerospike
 * @param  {{string: (sting|number)}} dimensions Key-value pairs of attributes
 * @return {array}                               Returns an array of filtered
 *                                               data using dimensions
 */
let filterDimensions = (data, dimensions) => {
    let result = data;
    for (let key in dimensions) {
        console.log(key, dimensions[key]);
        if (key == 'api_key') continue;
        result = filter(data, key, dimensions[key]);
    }
    return result;
};

/**
 * Helper function to filter the inital array of message data using key-value
 * pair of the dimensions.
 *
 * @param  {array}  data  Array of initial data before filtering
 * @param  {string} key   Key of the attribute
 * @param  {string} value Value of the attribute
 * @return {array}        Returns filtered array using key-value pair
 */
let filter = async (data, key, value) => {
    let result = data;
    switch (key) {
        case 'developer_id':
        case 'developer_name':
        case 'app_id':
            result =
                data.filter(message => message.bins.data.dmp.app_id == value);
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
            result =
                data.filter(message => message.bins.data.event.app_id == value);
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
