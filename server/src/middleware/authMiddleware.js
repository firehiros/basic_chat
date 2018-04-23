'use strict';

var passport = require('passport');

let authMiddleware = (callback) => {
    return function(req, res, next) {
        if (req.user) {
            next();
            return;
        }

        if (req.headers && req.headers.authorization) {
            let parts = req.headers.authorization.split(' ');
            if (parts.length === 2) {
                let scheme = parts[0];
                if (/^Basic$/i.test(scheme)) {
                    let auth = passport.authenticate('basic', { session: false });
                    return auth(req, res, next);
                }
            }
        }

        callback(req, res);
    };
}

module.exports = authMiddleware(function(req, res) {
    res.sendStatus(401);
});
