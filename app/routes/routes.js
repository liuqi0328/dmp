'use strict';

const uuidv1 = require('uuid/v1');
let User = require('../models/user');
let Client = require('../models/client');
let Invite = require('../models/invite');

const voiceAppController = require('../controllers/voiceAppController');
const profileController = require('../controllers/profileController');
const passportController = require('../controllers/passportController');
const contentTagController = require('../controllers/cms/contentTagController');
const contentController = require('../controllers/cms/contentController');

module.exports = function(app, passport) {
    // CMS Routes ==============================================================

    // CMS Content Tags Routes =================================================
    app.get('/cms/content_tags', isLoggedIn, contentTagController.getAll);
    app.get('/cms/content_tags/new', isLoggedIn, contentTagController.new);
    app.post('/cms/content_tags/new', isLoggedIn, contentTagController.create);
    app.get('/cms/content_tags/:contentTagId',
            isLoggedIn,
            contentTagController.getOne);
    app.get('/cms/content_tags/:contentTagId/update',
            isLoggedIn,
            contentTagController.updatePage);
    app.post('/cms/content_tags/:contentTagId/update',
             isLoggedIn,
             contentTagController.update);
    app.get('/cms/content_tags/:contentTagId/delete',
            isLoggedIn,
            contentTagController.delete);

    // CMS Contents Routes =====================================================
    app.get('/cms/contents', isLoggedIn, contentController.getAll);
    app.get('/cms/contents/:contentId',
            isLoggedIn,
            contentController.getOne);
    app.get('/cms/contents/new', isLoggedIn, contentController.new);
    app.post('/cms/contents/new', isLoggedIn, contentController.create);
    app.get('/cms/contents/:contentId/update',
            isLoggedIn,
            contentController.updatePage);
    app.put('/cms/contents/:contentId/update',
            isLoggedIn,
            contentController.update);

    // Voice App Routes
    app.get('/voiceapps', isLoggedIn, voiceAppController.getAllAlexaSkills);

    // NORMAL ROUTES ===========================================================
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        // The code in comments is to manually add things to the DB's!!!
        // ----------------------

        Invite.find({}, (err, data) => {
            if (err) console.log(err);
            console.log(data);
        });

        // User.remove({}, function(err) {
        //    console.log('collection removed')
        // });

        // User.find({}, (err, data) => {
        //    if (err)
        //       console.log(err);

        //    console.log(data);
        // });

        // let query = {_id:'5b33f1c65f4305167ee010cd'}

        // // User.update = function ({}, {cid: ''}, {multi: true}, function(err) { ... });
        // User.update(query, {role: 'Admin'}, function(err, result) {
        //    console.log('result: ', result);
        // })

        // let currentTime = Date.now();
        // var newClient = new Client();
        // newClient.id = 1;
        // newClient.name = 'Fresh Digital Group';
        // newClient.timeCreated = currentTime;
        // newClient.save();

        // ------------------------

        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, profileController.getProfile);

    // LOGOUT ==============================
    app.get('/logout', passportController.logOut);

    app.get('/console', passportController.getConsole);

    // =========================================================================
    // AUTHENTICATE (FIRST LOGIN) ==============================================
    // =========================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', passportController.getLogIn);

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
    }), passportController.postLogIn);

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', passportController.getSignUp);

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
    }));

    // facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['public_profile', 'email'],
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/',
    }));

    // twitter --------------------------------
    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', {
        scope: 'email',
    }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/',
    }));

    // google ---------------------------------
    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email'],
    }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/',
    }));

    // amazon ---------------------------------
    // send to google to do the authentication
    app.get('/auth/amazon', passport.authenticate('amazon', {
        scope: ['profile', 'email'],
    }));

    // the callback after google has authenticated the user
    app.get('/auth/amazon/callback', passport.authenticate('amazon', {
        successRedirect: '/profile',
        failureRedirect: '/',
    }));

    // =========================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =========
    // =========================================================================

    // locally --------------------------------
    app.get('/connect/local', passportController.getAuthorizeLocal);
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
    }));

    // facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', {
        scope: ['public_profile', 'email'],
    }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback', passport.authorize('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/',
    }));

    // twitter --------------------------------
    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', {
        scope: 'email',
    }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback', passport.authorize('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/',
    }));

    // google ---------------------------------
    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', {
        scope: ['profile', 'email'],
    }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback', passport.authorize('google', {
        successRedirect: '/profile',
        failureRedirect: '/',
    }));

    // amazon ---------------------------------
    // send to google to do the authentication
    app.get('/connect/amazon', passport.authorize('amazon', {
        scope: ['profile', 'email'],
    }));

    // the callback after google has authorized the user
    app.get('/connect/amazon/callback', passport.authorize('amazon', {
        successRedirect: '/profile',
        failureRedirect: '/',
    }));

    // =========================================================================
    // UNLINK ACCOUNTS =========================================================
    // =========================================================================
    // Used to unlink accounts.
    // For social accounts, just remove the token.
    // For local account, remove email and password.
    // User account will stay active in case they want to reconnect in the
    // future.

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, passportController.getUnlinkLocal);

    // facebook -------------------------------
    app.get('/unlink/facebook',
            isLoggedIn,
            passportController.getUnlinkFacebook);

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, passportController.getUnlinkTwitter);

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, passportController.getUnlinkGoogle);

    // amazon ---------------------------------
    app.get('/unlink/amazon', isLoggedIn, passportController.getUnlinkAmazon);

    // =============== TESTING ====================
        // Login FRSH Users
            // Profile page / home page
            app.get('/profile/frsh', isLoggedIn, function(req, res) {
            res.render('frsh-home.ejs', {
                user: req.user,
            });
            });

            // Clients page
                app.get('/profile/frsh/clients', isLoggedIn, function(req, res) {
                    Client.find({}, (err, data) => {
                        if (err)
                        console.log(err);

                        res.render('allClients.ejs', {
                        data : data
                        });
                    });
                });

                // Delete client
                    app.get('/profile/delete-client', isLoggedIn, function(req, res) {
                        let clientId = req.query.clientId; // Account to delete

                        Client.findOne({_id: clientId}).remove().exec();
                        res.redirect('/profile/frsh/clients');
                    });

                // Add client
                    app.get('/profile/frsh/clients/add-client', isLoggedIn, function(req, res) {
                        res.render('add-client.ejs');
                    });

                    app.post('/profile/frsh/clients/add-client', isLoggedIn, function(req, res) {
                        Client.findOne({ 'name' : req.body.clientName }, function(err, client) {
                        if (err)
                            throw err;

                        if (client)
                            return req.flash('addClientMessage', 'That client already exists.');
                            //this flash is probably not working. You're not printing it.

                        else {
                            Client.find(function(err, result) {
                                var clients = JSON.parse(JSON.stringify(result));
                                if (err)
                                    throw err;

                                let nextId;
                                let currentTime = Date.now();
                                for (let i = 0; i < clients.length; i++) {
                                    if (nextId == null || nextId <= clients[i].id)
                                    nextId = clients[i].id + 1;

                                    else
                                    continue;
                                }

                                var newClient = new Client();
                                newClient.id = nextId;
                                newClient.name = req.body.clientName;
                                newClient.timeCreated = currentTime;
                                newClient.save(function(err) {
                                    if (err)
                                    throw err;

                                 return newClient;
                              });
                              console.log('newClient: ', newClient);
                           });
                        }
                        });

                        res.redirect('/profile/frsh/clients');
                    })

                // Client users
                    app.get('/profile/frsh/clients/users', isLoggedIn, function(req, res) {
                        let clientId = req.query.clientId;

                        User.find({ownerId:clientId}, (err, data) => {
                        if (err)
                            console.log(err);

                        res.render('client-users.ejs', {
                            users : data
                        });
                        });
                    });

                    // Invite new user
                    app.get('/profile/frsh/clients/users/invite-user', isLoggedIn, function(req, res) {
                        res.render('invite-user.ejs', {
                        inviterId : req.user._id
                        });
                    });

                    app.post('/profile/frsh/clients/users/invite-user', isLoggedIn, function(req, res) {
                        Invite.findOne({ 'email' : req.body.userEmail }, function(err, invite) {
                        if (err)
                            throw err;

                        if (invite)
                            return req.flash('inviteUserMessage', 'That user is already invited.');

                        else {
                            var currentTime = Date.now();

                            var newInvite = new Invite();
                            newInvite.email = req.body.userEmail;
                            newInvite.permissions.push(req.body.userPermissions);
                            newInvite.clientId = req.body.clientId;
                            newInvite.uuid = uuidv1();
                            newInvite.timeCreated = currentTime;
                            newInvite.inviterId = req.body.inviterId;

                            newInvite.save(function(err) {
                                if (err)
                                    throw err;

                                return newInvite;
                            });
                        }

                        res.redirect('/profile/frsh/clients/users');
                        });

                        // We can invite a new user. The information above is saved in that table.
                        // Whe should now console.log a link to /invite?uuid={uuid}
                        // Print all data in invite model / can be deleted
                        Invite.find({}, (err, data) => {
                        if (err)
                            console.log(err);

                        console.log(data);
                        });
                        // --------------------------
                    });

            // Access to all users (for a specific client)
                // User settings
                    // Delete user
                    // Add user
                    // Edit user settings

        // Login client-user (admin)
            // User settings
            // Invite new user
            // Delete user

        // Login client-user (user)
            // Edit user settings
            // Delete user


        // In profile are 2 options:
        // 1. Profile info: show all users + their client-/company-number
        // 2. Client info: show all clients/companies. When you click on a company

        // -------------- PROFILE SECTION -------------------
        // Start page:
        app.get('/profile/profile-info',
                isLoggedIn,
                profileController.getProfileInfo);

        // Options in profile info:
        // 1. Add user
        // 2. Delete user
        // 3. Edit user

        // app.get('/profile/add-profile', isLoggedIn, function(req, res) {
        //    res.render('add-profile.ejs');
        // });

        app.get('/profile/delete-profile',
                isLoggedIn,
                profileController.getDeleteProfile);

        // Edit profile settings (email and permissions can be changed)
        app.get('/profile/edit-profile',
                isLoggedIn,
                profileController.getEditProfile);

        app.post('/profile/edit-profile',
                 isLoggedIn,
                 profileController.postEditProfile);

        // ----------- NOT USED AT THE MOMENT -------------
        // Update local account
        app.get('/profile/update/local', isLoggedIn, async function(req, res) {
            res.render('update-user.ejs', {
            message: req.flash('localUpdateMessage'),
            user: req.user,
            });
        });

        app.post('/profile/update/local', function(req, res) {
            console.log('req body: ', req.body);
            let userId = req.session.passport.user;

            let local = {};
            local.email = req.body.email;
            local.password = req.body.password;

            // query that finds the id that needs to be updated.
            let query = {_id: userId};

            User.update(query, {local: local}, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/profile');
                }
            });
        });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();

    res.redirect('/');
}
