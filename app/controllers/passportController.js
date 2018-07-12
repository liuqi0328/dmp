'use strict';

exports.logOut = (req, res) => {
    req.logout();
    res.redirect('/');
};

exports.getLogIn = (req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
};

exports.getConsole = (req, res) => {
    res.render('console.ejs');
};

exports.postLogIn = (req, res) => {
    console.log('req: ', req);
    // If this user is a FRSH admin...
    if (req.user.permissions.indexOf('FRSH Admin') > -1) {
        res.redirect('/profile/frsh');
    } else {
        res.redirect('/profile');
    }
};

exports.getSignUp = (req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
};

exports.getAuthorizeLocal = (req, res) => {
    res.render('connect-local.ejs', { message: req.flash('loginMessage') });
};

exports.getUnlinkLocal = (req, res) => {
    let user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save((err) => {
        res.redirect('/profile');
    });
};

exports.getUnlinkFacebook = (req, res) => {
    let user = req.user;
    user.facebook.token = undefined;
    user.save((err) => {
        res.redirect('/profile');
    });
};

exports.getUnlinkTwitter = (req, res) => {
    let user = req.user;
    user.twitter.token = undefined;
    user.save((err) => {
        res.redirect('/profile');
    });
};

exports.getUnlinkGoogle = (req, res) => {
    let user = req.user;
    user.google.token = undefined;
    user.save((err) => {
        res.redirect('/profile');
    });
};

exports.getUnlinkAmazon = (req, res) => {
    let user = req.user;
    user.google.token = undefined;
    user.save((err) => {
        res.redirect('/profile');
    });
};
