'use strict';

const User = require('../models/user');
const Client = require('../models/client');

exports.getProfile = (req, res) => {
    res.render('profile.ejs', {
        user: req.user,
    });
};

exports.getProfileInfo = (req, res) => {
    let currentUser = req.user;
    User.find({}, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }

        res.render('profile-info.ejs', {
            user: currentUser,
            data: data,
        });
    });
};

exports.getDeleteProfile = async (req, res) => {
    let accountID = req.query.accountId; // Account to delete

    User.findOne({ _id: accountID }).remove().exec();
    res.redirect('/profile/profile-info');
};

exports.getEditProfile = async (req, res) => {
    let userId = req.query.userId;

    User.find({ _id: userId }, (err, data) => {
        if (err) console.log(err);

        res.render('edit-profile.ejs', {
            user: data,
        });
    });
};

exports.postEditProfile = (req, res) => {
    console.log('req.body: ', req.body)
    let userId = req.body.userId;

    // Check if ownerId exists...
    Client.count({ id: req.body.ownerId }, (err, count) => {
        if (count == 0) {
            let data;
            User.find({ _id: userId }, (err, result) => {
                if (err) throw err;
                data = result;

                res.render('edit-profile.ejs', {
                    message: 'That is not a valid client id.',
                    user: data,
                });
            });
        } else {
            let updatedUser = new User({
                firstname: req.body.firstname,
                lastName: req.body.lastName,
                role: req.body.permissions,
                ownerId: req.body.ownerId,
                local: {
                    email: req.body.email,
                },
            });
            updatedUser = updatedUser.toObject();
            delete updatedUser._id;

            User.update({ _id: userId },
                        updatedUser,
                        { upsert: true },
                        (err, result) => {
                            if (err) throw err;
                            console.log(result);
                            res.redirect('/profile/profile-info');
                        });
        }
    });

    // --------------------
    // Client.find({id: req.body.ownerId}, function(err, result) {
    //    if (err)
    //       res.render('edit-profile.ejs', { message: 'That is not a valid client id.' });

    //    else {
    //       let updatedUser = new User({
    //          firstname   : req.body.firstname,
    //          lastName    : req.body.lastName,
    //          role        : req.body.permissions,
    //          ownerId     : req.body.ownerId,
    //          local       : {
    //             email    : req.body.email
    //          }
    //       });
    //       updatedUser = updatedUser.toObject();
    //       delete updatedUser._id;

    //       User.update({_id:userId}, updatedUser, { upsert : true }, function(err, result) {
    //          if (err)
    //             throw err;

    //          console.log(result);
    //          res.redirect('/profile/profile-info');
    //       })
    //    }
    // })
};

