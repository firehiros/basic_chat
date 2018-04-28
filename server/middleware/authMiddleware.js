'use strict';

var passport = require('passport');


module.exports.verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (!token){
        return res.status(403).send({
            auth: false,
            message: 'No token provided.'
        });
    }
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err){
            return res.status(500).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });
        }
        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
}
module.exports.authMiddleware = (fail) => {
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

        fail(req, res);
    };
}
