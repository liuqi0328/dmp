// load all the things we need
let LocalStrategy    = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let TwitterStrategy  = require('passport-twitter').Strategy;
let GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
let AmazonStrategy   = require('passport-amazon').Strategy;

// load up the user model
let User = require('../app/models/user');
let Client = require('../app/models/client');

// load the auth variables
let configAuth = require('./auth'); // use this one for testing

module.exports = (passport) => {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser((user, done) =>{
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    (req, email, password, done) => {
        if (email) email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(() => {
            User.findOne({ 'local.email': email }, (err, user) => {
                // if there are any errors, return the error
                if (err) return done(err);

                // if no user is found, return the message
                if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                } else {
                    return done(null, user);
                }
            });
        });
    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    (req, email, password, done) => {
        if (email) email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(() => {
            // if the user is not already logged in:
            if (!req.user) {
            User.findOne({ 'local.email': email }, async (err, user) => {
                // if there are any errors, return the error
                if (err) return done(err);

                // check to see if theres already a user with that email
                if (user) {
                    return done(null,
                                false,
                                req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    let clientName = req.body.accountName;
                    let checkExistingClient =
                        await Client.findOne({name: clientName});
                    if (checkExistingClient) {
                        console.log(checkExistingClient);
                        return done(null,
                                    false,
                                    req.flash('signupMessage', 'That account name is already taken.'));
                    }
                    let nextId = await Client.getNextId();
                    console.log('next id: ', nextId);
                    Client.create({ id: nextId, name: clientName}, (err, client) => {
                        if (err) {
                            console.error(err);
                            return done(err);
                        } else {
                            let newUser = new User();

                            newUser.local.email = email;
                            newUser.local.password =
                                newUser.generateHash(password);
                            newUser.permissions = ['User'];
                            newUser.firstName = req.body.firstName;
                            newUser.lastName = req.body.lastName;
                            newUser.client_id = client._id;
                            newUser.save((err) => {
                                if (err) return done(err);

                                return done(null, newUser);
                            });
                        }
                    });
                }
            });
            // if the user is logged in but has no local account...
            } else if ( !req.user.local.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'local.email': email }, (err, user) => {
                    if (err) return done(err);

                    if (user) {
                        return done(null,
                                    false,
                                    req.flash('loginMessage', 'That email is already taken.'));
                            // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        let user = req.user;
                        user.local.email = email;
                        user.local.password = user.generateHash(password);
                        user.save((err) => {
                            if (err) return done(err);

                            return done(null, user);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }
        });
    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    let fbStrategy = configAuth.facebookAuth;
    fbStrategy.passReqToCallback = true; // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    passport.use(new FacebookStrategy(fbStrategy, (req, token, refreshToken, profile, done) => {
        // asynchronous
        process.nextTick(() => {
            // check if the user is already logged in
            if (!req.user) {
                User.findOne({ 'facebook.id': profile.id }, (err, user) => {
                    if (err) return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                            user.save((err) => {
                                if (err) return done(err);
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        let newUser = new User();

                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name = profile.name.givenName + ' ' +
                            profile.name.familyName;
                        newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                        newUser.save((err) => {
                            if (err) return done(err);

                            return done(null, newUser);
                        });
                    }
                });
            } else {
                // user already exists and is logged in, we have to link accounts
                let user = req.user; // pull the user out of the session

                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                user.save((err) => {
                    if (err) return done(err);
                    return done(null, user);
                });
            }
        });
    }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({
        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    (req, token, tokenSecret, profile, done) => {
        // asynchronous
        process.nextTick(() => {
            // check if the user is already logged in
            if (!req.user) {
                User.findOne({ 'twitter.id': profile.id }, (err, user) => {
                    if (err) return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token;
                            user.twitter.username    = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save((err) => {
                            if (err) return done(err);

                            return done(null, user);
                            });
                        }
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        let newUser = new User();

                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save((err) => {
                            if (err) return done(err);
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                // user already exists and is logged in, we have to link accounts
                let user = req.user; // pull the user out of the session

                user.twitter.id          = profile.id;
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;

                user.save((err) => {
                    if (err) return done(err);
                    return done(null, user);
                });
            }
        });
    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    (req, token, refreshToken, profile, done) => {
        // asynchronous
        process.nextTick(() => {
            // check if the user is already logged in
            if (!req.user) {
                User.findOne({ 'google.id': profile.id }, (err, user) => {
                    if (err) return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                            user.save((err) => {
                            if (err) return done(err);
                            return done(null, user);
                            });
                        }
                        return done(null, user);
                    } else {
                        let newUser = new User();

                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                        newUser.save((err) => {
                            if (err) return done(err);
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                // user already exists and is logged in, we have to link accounts
                let user = req.user; // pull the user out of the session

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                user.save((err) => {
                    if (err) return done(err);
                    return done(null, user);
                });
            }
        });
    }));

    // =========================================================================
    // AMAZON ==================================================================
    // =========================================================================
    passport.use(new AmazonStrategy({
        clientID        : configAuth.amazonAuth.clientID,
        clientSecret    : configAuth.amazonAuth.clientSecret,
        callbackURL     : configAuth.amazonAuth.callbackURL,
        //passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    (req, token, refreshToken, profile, done) => {
        // asynchronous
        process.nextTick(() => {
            // check if the user is already logged in
            if (!req.user) {
                User.findOne({ 'google.id': profile.id }, (err, user) => {
                    if (err) return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.amazon.token) {
                            user.amazon.token = token;
                            user.amazon.name  = profile.displayName;
                            user.amazon.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                            user.save((err) => {
                                if (err) return done(err);
                                return done(null, user);
                            });
                        }
                        return done(null, user);
                    } else {
                        let newUser = new User();

                        newUser.amazon.id    = profile.id;
                        newUser.amazon.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.amazon.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                        newUser.save((err) => {
                            if (err) return done(err);
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                // user already exists and is logged in, we have to link accounts
                let user = req.user; // pull the user out of the session

                user.amazon.id    = profile.id;
                user.amazon.token = token;
                user.amazon.name  = profile.displayName;
                user.amazon.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                user.save((err) => {
                    if (err) return done(err);
                    return done(null, user);
                });
            }
        });
    }));
};
