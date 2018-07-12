'use strict';

exports.getProfile = (req, res) => {
    res.render('profile.ejs', {
        user: req.user,
    });
};
