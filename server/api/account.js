'use strict';

const _                 = require('lodash');
const fs                = require('fs');
const path              = require('path');

const User              = require('./../db/schema/user');
// const authMiddlewares   = require('./../middleware/authMiddleware');

module.exports = function() {
    let app = this.app;
    let config = this.config
    const authMiddlewares = this.middlewares['auth'];
    // core.on('account:update', function(data) {
    //     app.io.emit('users:update', data.user);
    // });

    //
    // Routes
    //
    app.get('/', authMiddlewares.verifyToken, function(req, res) {
    });

    app.get('/logout', function(req, res ) {
        // req.session.destroy();
    });

    app.post('/account/authenticate', function(req, res) {
        // req.io.route('account:login');

        var fields = req.body || req.data;

        User.authenticate(fields.username || fields.email, fields.password, (err, user, isMatch) => {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Sorry, we could not process your request.',
                    error: err
                });
            }
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else {
                if (!isMatch) {
                    res.status(401).json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {

                    let token = user.generateToken();

                    res.status(201).send({
                      success: true,
                      message: 'Authentication successful',
                      token: token,
                      user: user
                    });
                }
            }
        });
    });

    app.post('/account/register', function(req, res) {
        // req.io.route('account:register');
        let fields = req.body || req.data;

        // Sanity check the password
        let passwordConfirm = fields.passwordConfirm || fields.passwordConfirm || fields['password-confirm'];

        if (fields.password !== passwordConfirm) {
            return res.status(400).json({
                status: 'error',
                message: 'Password not confirmed'
            });
        }

        let data = {
            username: fields.username,
            email: fields.email,
            role: 'user',
            password: fields.password,
            firstName: fields.firstName || fields.firstname || fields['first-name'],
            lastName: fields.lastName || fields.lastname || fields['last-name'],
            avatar: fields.avatar || fields.avatar || fields['avatar']
        };

        User.create(data, function(err, user) {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Sorry, we could not process your request.',
                    error: err
                });
            }
            let token = user.generateToken();

            res.status(201).json({
                status: 'success',
                message: 'You\'ve been registered, please try logging in now!',
                token: token,
                user: user
            });
        });
    });

    app.get('/account/profile', authMiddlewares.verifyToken, function(req, res) {
        User.findById(req.userId, function (err, user) {
            if (err) {
                return res.status(500).send({
                    error: err
                })
            }
            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'User not found.',
                });
            } else if (user) {
                res.status(201).send({
                  success: true,
                  user: user
                });
            }
        });
        // req.io.route('account:whoami');
    });

    app.post('/account/update', authMiddlewares.verifyToken, function(req, res) {
        // req.io.route('account:register');
        var fields = req.body || req.data;
        let data = {
            username: fields.username,
            email: fields.email,
            currentPassword: fields.password || fields['current-password'] || fields.currentPassword,
            newPassword: fields['new-password'] || fields.newPassword,
            passwordConfirm: fields['confirm-password'] || fields.passwordConfirm,
            role: fields.role || fields['user-role'],
            firstName: fields.firstName || fields.firstname || fields['first-name'],
            lastName: fields.lastName || fields.lastname || fields['last-name'],
            avatar: fields.avatar || fields.avatar || fields['avatar']
        };

        if (data.newPassword && data.newPassword !== data.passwordConfirm) {
            return res.status(400).json({
                status: 'error',
                message: 'Password not confirmed'
            });
        }

        User.authenticate(data.username || data.email, data.currentPassword, (err, user, isMatch) => {
            if (err) {
                return res.status(401).json({
                    status: 'error',
                    message: 'There were problems authenticating you.',
                    error: err
                });
            }

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else {
                if (!isMatch) {
                    res.status(401).json({
                        success: false,
                        message: 'Incorrect login credentials.'
                    });
                } else {

                    User.updateProfile(req.userId, data, function (err, user, reason) {
                        if (err || !user) {
                            return res.status(400).json({
                                status: 'error',
                                message: 'Unable to update your account.',
                                reason: reason,
                                error: err
                            });
                        }
                        let token = user.generateToken();
                        res.status(201).json({
                          success: true,
                          message: 'Update successfully',
                          token: token,
                          user: user
                        });
                    });
                }
            }
        });
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
