'use strict';

const _                 = require('lodash');
const fs                = require('fs');
const path              = require('path');

const User              = require('./../db/schema/user');
// const authMiddlewares   = require('./../middleware/authMiddleware');

module.exports = function() {
    let app = this.app;
    let config = this.config;
    let authMiddlewares = this.middlewares['auth'];
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
        let identifier = fields.username || fields.email || fields.indentifier;
        if (!identifier || !fields.password) {
            return res.status(400).json({
                success: false,
                message: 'Authentication failed. Credentials is incorrect.'
            });
        }
        User.authenticate(identifier, fields.password, (err, user, isMatch) => {
            if (err) {
                console.log(err);
                return res.status(400).json(err);
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
                console.log(err);
                return res.status(400).json(err);
            }
            let token = user.generateToken();

            res.status(201).json({
                message: 'You\'ve been registered, please try logging in now!',
                token: token,
                user: user
            });
        });
    });

    app.get('/account/profile', authMiddlewares.verifyToken, function(req, res) {
        let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
        User.findById(userId, function (err, user) {
            if (err) {
                console.log(err);
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
        let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
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
                message: 'Password not confirmed'
            });
        }

        User.authenticate(data.username || data.email, data.currentPassword, (err, user, isMatch) => {
            if (err) {
                console.log(err);
                return res.status(401).json({
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

                    User.updateProfile(userId, data, function (err, user, reason) {
                        if (err) {
                            return res.status(400).json(err);
                        }
                        if (!user) {
                            res.status(401).json({
                                success: false,
                                message: 'Authentication failed. User not found.'
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
};
