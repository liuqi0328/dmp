'use strict';

/*
 * Report_interval:
 *     Current Hour
 *     Last Hour
 *     Today
 *     Yesterday
 *     Last 48 Hours
 *     Last Week
 *     Last 30 days
 *     Month to Date
 *     Month to Yesterday
 *
 * Dimensions:
 *     Developer ID
 *     App ID
 *     App Name
 *     Developer Name
 *     *Intent
 *     *Intent Attribute
 *     User ID
 *     Device ID
 *     Session ID
 *     Application Type
 *     Application Vertical
 *     Session length
 *
 * Metrics:
 *     Total Conversations
 *     Engagement Rate %
 *     Unknown Responses
 *     Conversation Time (Min/Sec)
 */

const helper = require('./helper');

exports.timeInterval = async (req, res) => {
    let client = res.locals.client;

    // TODO: uncomment to check for user
    // return unauthorized error if using the api key for a voice app
    // if (!(client instanceof User)) return res.sendStatus(401);

    let clientId = client.client_id;
    let timeInterval = req.params.time_interval;

    if (!timeInterval) {
        return res.json({message: 'Please provide a time interval param.'});
    }

    let data = await helper.getDataFromAerospike(clientId, timeInterval);
    if (data.length < 1) return res.sendStatus(404);

    console.log(req.query);
    let filteredData = await helper.filterDimensions(data, req.query);

    let finalData = [];
    for (let i = 0; i < filteredData.length; i++) {
        let returnData = filteredData[i].bins.data;
        finalData.push(returnData);
    }

    if (finalData.length < 1) {
        res.sendStatus(404);
    } else {
        res.send(finalData);
    }
};

exports.allMessages = async (req, res) => {
    let client = res.locals.client;

    // TODO: uncomment to check for user
    // return unauthorized error if using the api key for a voice app
    // if (!(client instanceof User)) return res.sendStatus(401);

    let clientId = client.client_id;

    let data = await helper.getDataFromAerospike(clientId, '');
    if (data.length < 1) return res.sendStatus(404);

    console.log(req.query);
    let filteredData = await helper.filterDimensions(data, req.query);

    let finalData = [];
    for (let i = 0; i < filteredData.length; i++) {
        let returnData = filteredData[i].bins.data;
        finalData.push(returnData);
    }

    if (finalData.length < 1) {
        res.sendStatus(404);
    } else {
        res.send(finalData);
    }
};
