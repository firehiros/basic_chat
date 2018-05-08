'use strict';

// var passport = require('passport');
const _           = require('lodash')
const jwt         = require('jsonwebtoken');
const config      = require('./../config');

module.exports.verifyToken = (req, res, next) => {
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    var req_scopes = req.body.scope || req.params.scope || req.headers["x-security-scopes"];
    if (!token){
        return res.status(403).send({
            auth: false,
            message: 'No token provided.'
        });
    }
    jwt.verify(token, config.tokenSecrect, function(err, payload) {
        if (err){
            return res.status(401).send({
                auth: false,
                message: 'Failed to authenticate token.',
                error: err
            });
        }
        // TODO: create token with permission
        // if (_.intersection(payload.scopes, req_scopes).length == 0) {
        //
        //     console.log(req_scopes);
        //     console.log(payload.scopes);
        //     return res.status(401).send({
        //         auth: false,
        //         message: 'Not Authorized!'
        //     });
        // }
        // else {
            // if everything good, save to request for use in other routes
            req.user = payload.id;
            next();
        // }
    });
}
