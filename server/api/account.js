'use strict';

const _                 = require('lodash');
const fs                = require('fs');
const User              = require('./../db/schema/user');
// const authMiddlewares   = require('./../middleware/authMiddleware');
const path              = require('path');
const settings          = require('./../config');

module.exports = function() {

    let app = this.app;
    const authMiddlewares = this.middlewares['auth'];
    // core.on('account:update', function(data) {
    //     app.io.emit('users:update', data.user);
    // });

    //
    // Routes
    //
    app.get('/', authMiddlewares.verifyToken, function(req, res) {
        // return success

        // res.render('chat.html', {
        //     account: req.user,
        //     settings: settings,
        //     version: psjon.version
        // });
    });

    app.get('/logout', function(req, res ) {
        // req.session.destroy();
    });

    app.post('/account/authenticate', function(req) {
        // req.io.route('account:login');
        // find the user
        User.findOne({
            name: req.body.name
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
              res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                // check if password matches
                if (user.password != req.body.password) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {

                    // if user is found and password is right
                    // create a token with only our given payload
                    // we don't want to pass in the entire user since that has the password
                    const payload = {
                        admin: user.admin
                    };
                    var token = jwt.sign(payload, app.get('superSecret'), {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({
                      success: true,
                      message: 'Enjoy your token!',
                      token: token
                    });
                }

          }

        });
    });

    app.post('/account/register', function(req) {
        // req.io.route('account:register');
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);

        User.create({
            username : req.body.username,
            email : req.body.email,
            role: 'user', // TODO: Make const role
            password : hashedPassword
        },
        function (err, user) {
            if (err) {
                return res.status(500).send("There was a problem registering the user.") // TODO: make const message
            }
            let token = user.generateToken();
            // // create a token
            // var token = jwt.sign({ id: user._id }, config.secret, {
            //     expiresIn: 86400 // expires in 24 hours
            // });
            res.status(200).send({
                auth: true,
                token: token
            });
        });
    });

    app.get('/account', authMiddlewares.verifyToken, function(req) {
        // req.io.route('account:whoami');
    });

    app.post('/account/profile', authMiddlewares.verifyToken, function(req) {
        // req.io.route('account:profile');
    });

    app.post('/account/settings', authMiddlewares.verifyToken, function(req) {
        // req.io.route('account:settings');
    });

    app.post('/account/token/generate', authMiddlewares.verifyToken, function(req) {
        // req.io.route('account:generate_token');
    });

    app.post('/account/token/revoke', authMiddlewares.verifyToken, function(req) {
        // req.io.route('account:revoke_token');
    });

    // //
    // // Sockets
    // //
    // app.io.route('account', {
    //     whoami: function(req, res) {
    //         res.json(req.user);
    //     },
    //
    //     profile: function(req, res) {
    //         var form = req.body || req.data,
    //             data = {
    //                 displayName: form.displayName || form['display-name'],
    //                 firstName: form.firstName || form['first-name'],
    //                 lastName: form.lastName || form['last-name'],
    //                 openRooms: form.openRooms,
    //             };
    //
    //         core.account.update(req.user._id, data, function (err, user) {
    //             if (err) {
    //                 return res.json({
    //                     status: 'error',
    //                     message: 'Unable to update your profile.',
    //                     errors: err
    //                 });
    //             }
    //
    //             if (!user) {
    //                 return res.sendStatus(404);
    //             }
    //
    //             res.json(user);
    //         });
    //     },
    //     settings: function(req, res) {
    //         if (req.user.usingToken) {
    //             return res.status(403).json({
    //                 status: 'error',
    //                 message: 'Cannot change account settings ' +
    //                          'when using token authentication.'
    //             });
    //         }
    //
    //         var form = req.body || req.data,
    //             data = {
    //                 username: form.username,
    //                 email: form.email,
    //                 currentPassword: form.password ||
    //                     form['current-password'] || form.currentPassword,
    //                 newPassword: form['new-password'] || form.newPassword,
    //                 confirmPassowrd: form['confirm-password'] ||
    //                     form.confirmPassword
    //             };
    //
    //         auth.authenticate(req, req.user.uid || req.user.username,
    //                           data.currentPassword, function(err, user) {
    //             if (err) {
    //                 return res.status(400).json({
    //                     status: 'error',
    //                     message: 'There were problems authenticating you.',
    //                     errors: err
    //                 });
    //             }
    //
    //             if (!user) {
    //                 return res.status(401).json({
    //                     status: 'error',
    //                     message: 'Incorrect login credentials.'
    //                 });
    //             }
    //
    //             core.account.update(req.user._id, data, function (err, user, reason) {
    //                 if (err || !user) {
    //                     return res.status(400).json({
    //                         status: 'error',
    //                         message: 'Unable to update your account.',
    //                         reason: reason,
    //                         errors: err
    //                     });
    //                 }
    //                 res.json(user);
    //             });
    //         });
    //     },
    //     generate_token: function(req, res) {
    //         if (req.user.usingToken) {
    //             return res.status(403).json({
    //                 status: 'error',
    //                 message: 'Cannot generate a new token ' +
    //                          'when using token authentication.'
    //             });
    //         }
    //
    //         core.account.generateToken(req.user._id, function (err, token) {
    //             if (err) {
    //                 return res.json({
    //                     status: 'error',
    //                     message: 'Unable to generate a token.',
    //                     errors: err
    //                 });
    //             }
    //
    //             res.json({
    //                 status: 'success',
    //                 message: 'Token generated.',
    //                 token: token
    //             });
    //         });
    //     },
    //     revoke_token: function(req, res) {
    //         if (req.user.usingToken) {
    //             return res.status(403).json({
    //                 status: 'error',
    //                 message: 'Cannot revoke token ' +
    //                          'when using token authentication.'
    //             });
    //         }
    //
    //         core.account.revokeToken(req.user._id, function (err) {
    //             if (err) {
    //                 return res.json({
    //                     status: 'error',
    //                     message: 'Unable to revoke token.',
    //                     errors: err
    //                 });
    //             }
    //
    //             res.json({
    //                 status: 'success',
    //                 message: 'Token revoked.'
    //             });
    //         });
    //     },
    //     register: function(req, res) {
    //
    //         if (req.user ||
    //             !auth.providers.local ||
    //             !auth.providers.local.enableRegistration) {
    //
    //             return res.status(403).json({
    //                 status: 'error',
    //                 message: 'Permission denied'
    //             });
    //         }
    //
    //         var fields = req.body || req.data;
    //
    //         // Sanity check the password
    //         var passwordConfirm = fields.passwordConfirm || fields.passwordconfirm || fields['password-confirm'];
    //
    //         if (fields.password !== passwordConfirm) {
    //             return res.status(400).json({
    //                 status: 'error',
    //                 message: 'Password not confirmed'
    //             });
    //         }
    //
    //         var data = {
    //             provider: 'local',
    //             username: fields.username,
    //             email: fields.email,
    //             password: fields.password,
    //             firstName: fields.firstName || fields.firstname || fields['first-name'],
    //             lastName: fields.lastName || fields.lastname || fields['last-name'],
    //             displayName: fields.displayName || fields.displayname || fields['display-name']
    //         };
    //
    //         core.account.create('local', data, function(err) {
    //             if (err) {
    //                 var message = 'Sorry, we could not process your request';
    //                 // User already exists
    //                 if (err.code === 11000) {
    //                     message = 'Email has already been taken';
    //                 }
    //                 // Invalid username
    //                 if (err.errors) {
    //                     message = _.map(err.errors, function(error) {
    //                         return error.message;
    //                     }).join(' ');
    //                 // If all else fails...
    //                 } else {
    //                     console.error(err);
    //                 }
    //                 // Notify
    //                 return res.status(400).json({
    //                     status: 'error',
    //                     message: message
    //                 });
    //             }
    //
    //             res.status(201).json({
    //                 status: 'success',
    //                 message: 'You\'ve been registered, ' +
    //                          'please try logging in now!'
    //             });
    //         });
    //     },
    //     login: function(req, res) {
    //         auth.authenticate(req, function(err, user, info) {
    //             if (err) {
    //                 return res.status(400).json({
    //                     status: 'error',
    //                     message: 'There were problems logging you in.',
    //                     errors: err
    //                 });
    //             }
    //
    //             if (!user && info && info.locked) {
    //                 return res.status(403).json({
    //                     status: 'error',
    //                     message: info.message || 'Account is locked.'
    //                 });
    //             }
    //
    //             if (!user) {
    //                 return res.status(401).json({
    //                     status: 'error',
    //                     message: info && info.message ||
    //                              'Incorrect login credentials.'
    //                 });
    //             }
    //
    //             req.login(user, function(err) {
    //                 if (err) {
    //                     return res.status(400).json({
    //                         status: 'error',
    //                         message: 'There were problems logging you in.',
    //                         errors: err
    //                     });
    //                 }
    //                 var temp = req.session.passport;
    //                 req.session.regenerate(function(err) {
    //                     if (err) {
    //                         return res.status(400).json({
    //                             status: 'error',
    //                             message: 'There were problems logging you in.',
    //                             errors: err
    //                         });
    //                     }
    //                     req.session.passport = temp;
    //                     res.json({
    //                         status: 'success',
    //                         message: 'Logging you in...'
    //                     });
    //                 });
    //             });
    //         });
    //     }
    // });
};
