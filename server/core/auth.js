'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var tokenAuth = (username, password, done) => {
    if (!done) {
        done = password;
    }

    let User = mongoose.model('User');
    User.findByToken(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    });
}
module.exports.setup = (app) => {

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function(username, password, done) {
        let User = mongoose.model('User');
        User.authenticate(username, password, function(err, user) {
            if (err) {
                return done(null, false, {
                    message: 'Username or password is incorrect.'
                });
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, null, {
                    message: 'Login failed wrong user credentials.'
                });
            }
        });
    }));

    passport.use(new BasicStrategy(tokenAuth));
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        let User = mongoose.model('User');
        User.findOne({ _id: id }, function(err, user) {
            done(err, user);
        });
    });

    app.use(passport.initialize());
    app.use(passport.session());
}
