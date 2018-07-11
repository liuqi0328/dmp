'use strict';

const rp = require('request-promise');

exports.timeInterval = (req, res) => {
    let client = res.locals.client;
    let timeInterval = req.params.time_interval;

    if (!timeInterval) {
        return res.json({message: 'Please provide a time interval param.'});
    }

    let data;
    switch (timeInterval) {
        case 'current_hour':
            data = currentHourInterval(accountId);
            break;
        case 'last_hour':
        case 'today':
        case 'yesterday':
        case 'last_48_hours':
        case 'last_week':
        case 'last_30_days':
        case 'month_to_date':
        case 'month_to_yesterday':
    }
    return data;
}

let currentHourInterval = async (accountId) => {
    let data = await getAccountData(accountId);
    console.log(data);
    if (!data) return;

    let currentTime = new Date(Date.now());
    let result = [];
    for (let i = 0; i < data.length; i++) {
        let timestamp = data[i].bins.data.timestamp;
        let dataTime = new Date(timestamp);
        if (currentTime - dataTime <= 3600000) result.push(data[i]);
    }
    console.log('result: ', result);
    return result;
};

let getAccountData = async (accountId) => {
    let options = {
        method: 'GET',
        uri: `http://localhost:8000/account/${accountId}`,
        json: true,
        headers: {
            'User-Agent': 'BeyondVoiceSDK',
        },
    };
    try {
        let data = rp(options);
        return data;
    } catch (err) {
        console.log('get account data from aerospike error...!');
        console.error(err);
        return;
    }
};



currentHourInterval("testOwner");