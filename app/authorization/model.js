'use strict';

let mongoose = require('mongoose');

/**
 * Configuration.
 */

let ClientModel = require('./application');
let TokenModel = require('./acessToken');
let VoiceAppModel = require('../models/voiceApp');

/**
 * Add example client and user to the database (for debug).
 */

let loadExampleData = () => {
    let client = new ClientModel({
        clientId: 'application1',
        clientSecret: 'secret1',
        grants: ['client_credentials'],
    });

    let user = new VoiceAppModel({
        name: 'test',
        owner: 'test',
    });

    client.save((err, client) => {
        if (err) {
            return console.error(err);
        }
        console.log('Created client', client);
    });

    user.save((err, user) => {
        if (err) {
            return console.error(err);
        }
        console.log('Created user', user);
    });
};

/**
 * Dump the database content (for debug).
 */

let dump = () => {
    ClientModel.find((err, clients) => {
        if (err) {
            return console.error(err);
        }
        console.log('clients', clients);
    });

    TokenModel.find((err, tokens) => {
        if (err) {
            return console.error(err);
        }
        console.log('tokens', tokens);
    });

    VoiceAppModel.find((err, users) => {
        if (err) {
            return console.error(err);
        }
        console.log('users', users);
    });
};

/*
 * Get access token.
 */

let getAccessToken = (bearerToken, callback) => {
    console.log('getAccessToken: ', bearerToken);
    // console.trace();

    // TokenModel.findOne({accessToken: bearerToken}, (err, token) => {
    //     if (err) {
    //         console.log('oauth model getAccessToken err');
    //         console.error(err);
    //         return;
    //     }
    //     return {
    //         access_token: token.accessToken,
    //         expires_at: token.expires,
    //     };
    // });

    return new Promise((resolve, reject) => {
        TokenModel.findOne({
            accessToken: bearerToken,
        }, (err, token) => {
            if (err) {
                console.log('oauth model getAccessToken err');
                console.error(err);
                reject(err);
            }

            console.log('getAccessToken data: ', token);

            if (token == null) {
                console.log('null');
                resolve();
            } else {
                let result = {
                    access_token: token.accessToken,
                    expires_at: token.expires,
                };
                console.log(result);
                resolve(result);
            }
            // let result = {
            //     access_token: token.accessToken,
            //     expires_at: token.expires,
            // };
            // // console.log(result, token);
            // resolve(result);
        });
    });
};

/**
 * Get client.
 */

let getClient = (clientId, clientSecret) => {
    // ClientModel.findOne({
    //     clientId: clientId,
    //     clientSecret: clientSecret,
    // },);

    console.log('getClient params: ', clientId, clientSecret);

    // let client = ClientModel.where({
    //     clientId: clientId,
    //     clientSecret: clientSecret,
    // });

    // ClientModel.findOne({
    //     clientId: clientId,
    //     clientSecret: clientSecret,
    // }, (err, doc) => {
    //     if (err) {
    //         console.log('oauth model getClient err');
    //         console.error(err);
    //         return;
    //     }
    //     if (doc) {
    //         console.log(doc);
    //         return {
    //             id: doc.id,
    //             redirectUris: [],
    //             grants: doc.grants,
    //         };
    //     }
    // });

    return new Promise((resolve, reject) => {
        ClientModel.findOne({
            clientId: clientId,
            clientSecret: clientSecret,
        }, (err, doc) => {
            if (err) {
                console.log('oauth model getClient err');
                console.error(err);
                reject(err);
            }
            if (doc) {
                console.log(doc);
                let data = { id: doc.id, redirectUris: [], grants: doc.grants };
                resolve(data);
            }
        });
    });
};

/**
 * Grant type allowed.
 */

// let grantTypeAllowed = (clientId, grantType, callback) => {
//     callback(false, grantType === 'client_credentials');
// };

/**
 * Save token.
 */

let saveToken = (token, client, user) => {
    let accessToken = new TokenModel({
        accessToken: token.accessToken,
        expires: token.accessTokenExpiresAt,
        clientId: client.id,
        user: user,
    });

    console.log('access token: ', accessToken);
    // accessToken.save((err, doc) => {
    //     if (err) {
    //         console.error(err);
    //         reject(err);
    //     }

    //     console.log('access token saved: ', doc);

    //     return {
    //         accessToken: doc.accessToken,
    //         accessTokenExpiresAt: doc.expires,
    //         client: { id: doc.clientId },
    //         user: { id: doc.user._id },
    //     };
    // });
    return new Promise((resolve, reject) => {
        accessToken.save((err, doc) => {
            if (err) {
                console.error(err);
                reject(err);
            }

            console.log('access token saved: ', doc);

            let data = {
                accessToken: doc.accessToken,
                accessTokenExpiresAt: doc.expires,
                client: { id: doc.clientId },
                user: { id: doc.user._id },
            };
            resolve(data);
        });
    });
};

// /*
//  * Get user.
//  * (Only used by password grant types)
//  */

// let getUser = (username, password, callback) => {
//     VoiceAppModel.findOne({name: username}, callback);
// };

/*
 * Method used only by client_credentials grant type.
 */

// let getUserFromClient = (clientId, clientSecret, callback) => {
//     let clients = ClientModel.findOne({
//         clientId: clientId,
//         clientSecret: clientSecret,
//     });

//     let user;

//     if (clients.length) {
//         user = VoiceAppModel.findById(clients.app_id);
//     }

//     callback(false, user);
// };

let getUserFromClient = (client) => {
    let clientModel = ClientModel.findOne({
        clientId: client.clientId,
        clientSecret: client.clientSecret,
    });

    let appId = clientModel.app_id;

//   let user;

//   if (clients.length) {
//     user = VoiceAppModel.findById(clients.app_id);
//   }

    let user = VoiceAppModel.where({_id: appId});
    return user;
};

let verifyScope = (token, scope) => {
    console.log('verfiy scope token: ', token);
    return true;
};

/**
 * Export model definition object.
 */

module.exports = {
    getAccessToken: getAccessToken,
    getClient: getClient,
    // grantTypeAllowed: grantTypeAllowed,
    saveToken: saveToken,
    // getUser: getUser,
    getUserFromClient: getUserFromClient,
    verifyScope: verifyScope,
    loadExampleData: loadExampleData,
};
