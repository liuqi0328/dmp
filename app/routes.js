const uuidv1 = require('uuid/v1');
var User = require('./models/user');
var Client = require('../app/models/client');
var Invite = require('../app/models/invite');

module.exports = function(app, passport) {
// NORMAL ROUTES ===============================================================
// show the home page (will also have our login links)
   app.get('/', function(req, res) {
      
      // The code in comments is to manually add things to the DB's!!!
      // ----------------------

      // Invite.find({}, (err, data) => {
      //    if (err) 
      //       console.log(err);

      //    console.log(data);
      // });

      // User.remove({}, function(err) { 
      //    console.log('collection removed') 
      // });

      // User.find({}, (err, data) => {
      //    if (err) 
      //       console.log(err);

      //    console.log(data);
      // });

      let query = {_id:'5b4780595273fa064c6ab0ee'}

      // User.update = function ({}, {cid: ''}, {multi: true}, function(err) { ... });
      User.update(query, {permissions: 'FRSH Admin'}, function(err, result) {
         console.log('result: ', result);
      })

      // let currentTime = Date.now();
      // var newClient = new Client();
      // newClient.id = 1;
      // newClient.name = 'Fresh Digital Group';
      // newClient.timeCreated = currentTime;
      // newClient.save();

      //------------------------

      res.render('index.ejs');
   });

   // PROFILE SECTION =========================
   app.get('/profile', isLoggedIn, function(req, res) {
      res.render('profile.ejs', {
         user : req.user
      });
   });

   // LOGOUT ==============================
   app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
   });

   app.get('/console', function(req, res) {
      res.render('console.ejs');
   });

   // =============================================================================
   // AUTHENTICATE (FIRST LOGIN) ==================================================
   // =============================================================================

      // locally --------------------------------
         // LOGIN ===============================
            // show the login form
            app.get('/login', function(req, res) {
               res.render('login.ejs', { message: req.flash('loginMessage') });
            });

            // process the login form
            app.post('/login', passport.authenticate('local-login', {
               failureRedirect : '/login', // redirect back to the signup page if there is an error
               failureFlash : true // allow flash messages
            }), (req, res) => {
               // If this user is a FRSH admin...
               if (req.user.permissions.indexOf('FRSH Admin') > -1) { 
                  res.redirect('/profile/frsh');
               } else {
                  res.redirect('/profile/frsh');
               }
            })

         // SIGNUP =================================
            // show the signup form
            app.get('/signup', function(req, res) {
               res.render('signup.ejs', { message: req.flash('signupMessage') });
            });

            // process the signup form
            app.post('/signup', passport.authenticate('local-signup', {
               successRedirect : '/profile', // redirect to the secure profile section
               failureRedirect : '/signup', // redirect back to the signup page if there is an error
               failureFlash : true // allow flash messages
            }));

      // facebook -------------------------------
         // send to facebook to do the authentication
         app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

         // handle the callback after facebook has authenticated the user
         app.get('/auth/facebook/callback', passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
         }));

      // twitter --------------------------------
         // send to twitter to do the authentication
         app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

         // handle the callback after twitter has authenticated the user
         app.get('/auth/twitter/callback', passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
         }));

      // google ---------------------------------
         // send to google to do the authentication
         app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

         // the callback after google has authenticated the user
         app.get('/auth/google/callback', passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
         }));

      // amazon ---------------------------------
         // send to google to do the authentication
         app.get('/auth/amazon', passport.authenticate('amazon', { scope : ['profile', 'email'] }));

         // the callback after google has authenticated the user
         app.get('/auth/amazon/callback', passport.authenticate('amazon', {
            successRedirect : '/profile',
            failureRedirect : '/'
         }));
       
   // =============================================================================
   // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
   // =============================================================================

      // locally --------------------------------
         app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
         });
         app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
         }));

      // facebook -------------------------------
         // send to facebook to do the authentication
         app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));

         // handle the callback after facebook has authorized the user
         app.get('/connect/facebook/callback', passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
         }));

      // twitter --------------------------------
         // send to twitter to do the authentication
         app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

         // handle the callback after twitter has authorized the user
         app.get('/connect/twitter/callback', passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
         }));

      // google ---------------------------------
         // send to google to do the authentication
         app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

         // the callback after google has authorized the user
         app.get('/connect/google/callback', passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
         }));

      // amazon ---------------------------------
         // send to google to do the authentication
         app.get('/connect/amazon', passport.authorize('amazon', { scope : ['profile', 'email'] }));

         // the callback after google has authorized the user
         app.get('/connect/amazon/callback', passport.authorize('amazon', {
            successRedirect : '/profile',
            failureRedirect : '/'
         }));

   // =============================================================================
   // UNLINK ACCOUNTS =============================================================
   // =============================================================================
   // Used to unlink accounts. 
   // For social accounts, just remove the token.
   // For local account, remove email and password.
   // User account will stay active in case they want to reconnect in the future

   // local -----------------------------------
      app.get('/unlink/local', isLoggedIn, function(req, res) {
         var user            = req.user;
         user.local.email    = undefined;
         user.local.password = undefined;
         user.save(function(err) {
            res.redirect('/profile');
         });
      });

   // facebook -------------------------------
      app.get('/unlink/facebook', isLoggedIn, function(req, res) {
         var user            = req.user;
         user.facebook.token = undefined;
         user.save(function(err) {
            res.redirect('/profile');
         });
      });

   // twitter --------------------------------
      app.get('/unlink/twitter', isLoggedIn, function(req, res) {
         var user           = req.user;
         user.twitter.token = undefined;
         user.save(function(err) {
            res.redirect('/profile');
         });
      });

   // google ---------------------------------
      app.get('/unlink/google', isLoggedIn, function(req, res) {
         var user          = req.user;
         user.google.token = undefined;
         user.save(function(err) {
            res.redirect('/profile');
         });
      });

   // amazon ---------------------------------
      app.get('/unlink/amazon', isLoggedIn, function(req, res) {
         var user          = req.user;
         user.google.token = undefined;
         user.save(function(err) {
            res.redirect('/profile');
         });
      });

   // =============== TESTING ====================
      // Login FRSH Users
         // Profile page / home page
         app.get('/profile/frsh', isLoggedIn, function(req, res) {
            res.render('frsh-home.ejs', {
               user : req.user
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
      app.get('/profile/profile-info', isLoggedIn, async function(req, res) {
         let currentUser = req.user;
         User.find({}, (err, data) => {
            if (err)
               console.log(err);

            res.render('profile-info.ejs', {
               user : currentUser,
               data : data
            });
         });
      })

      // Options in profile info: 
      // 1. Add user
      // 2. Delete user
      // 3. Edit user

      // app.get('/profile/add-profile', isLoggedIn, function(req, res) {
      //    res.render('add-profile.ejs');
      // });

      app.get('/profile/delete-profile', isLoggedIn, async function(req, res) {
         let accountID = req.query.accountId; // Account to delete

         User.findOne({_id: accountID}).remove().exec();
         res.redirect('/profile/profile-info');
      });

      // Edit profile settings (email and permissions can be changed)
      app.get('/profile/edit-profile', isLoggedIn, async function(req, res) {
         let userId = req.query.userId;

         User.find({_id:userId}, (err, data) => {
            if (err)
               console.log(err);

            res.render('edit-profile.ejs', {
               user : data
            });
         });
      });

      app.post('/profile/edit-profile', isLoggedIn, function(req, res) {
         console.log('req.body: ', req.body)
         let userId = req.body.userId;

         // Check if ownerId exists...
         Client.count({id: req.body.ownerId}, function(err, count) {
            if (count == 0) {
               let data;
               User.find({_id: userId}, function(err, result) {
                  if (err)
                     throw err
                  data = result;

                  res.render('edit-profile.ejs', { 
                     message: 'That is not a valid client id.',
                     user: data
                  });
               });
            }
            
            else {
               let updatedUser = new User({
                  firstname   : req.body.firstname,
                  lastName    : req.body.lastName,
                  role        : req.body.permissions,
                  ownerId     : req.body.ownerId,
                  local       : {
                     email    : req.body.email
                  }
               });
               updatedUser = updatedUser.toObject();
               delete updatedUser._id;

               User.update({_id:userId}, updatedUser, { upsert : true }, function(err, result) {
                  if (err)
                     throw err;

                  console.log(result);
                  res.redirect('/profile/profile-info');
               })
            }
         })


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

         
      });

      // ----------- NOT USED AT THE MOMENT -------------
      // Update local account
      app.get('/profile/update/local', isLoggedIn, async function(req, res) {
         res.render('update-user.ejs', {
            message: req.flash('localUpdateMessage'),
            user : req.user
         });
      });

      app.post('/profile/update/local', function(req, res) {
         console.log('req body: ', req.body);
         let userId = req.session.passport.user;

         let local = {};
         local.email = req.body.email;
         local.password = req.body.password;

         // query that finds the id that needs to be updated.
         let query = {_id:userId}

         User.update(query, {local: local}, function(err) {
            if (err) {
               console.log(err);
            } else {
               res.redirect('/profile');
            }
         })
      });
   };

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
   if (req.isAuthenticated())
      return next();

   res.redirect('/');
}
