'use strict';

const _ = require('lodash');
const util = require('util');

const EventEmitter = require('events');
const User          = require('./../db/schema/user');

let sanitizeQuery = (query, options) => {
    if (options.defaults.take && !query.take) {
        query.take = options.defaults.take;
    }
    if (options.maxTake < query.take) {
        query.take = options.maxTake;
    }

    if (typeof query.reverse === 'string') {
        query.reverse = query.reverse.toLowerCase() === 'true';
    }

    if (typeof query.reverse === 'undefined') {
        query.reverse = options.defaults.reverse;
    }

    return query;
}

module.exports = class UserController extends EventEmitter {
    constructor(){
        super();
    }
    list(options, cb) {
        options = options || {};

        options = sanitizeQuery(options, {
            defaults: {
                take: 500
            },
            maxTake: 5000
        });

        var find = User.find();

        if (options.skip) {
            find.skip(options.skip);
        }

        if (options.take) {
            find.limit(options.take);
        }

        find.exec(cb);
    }
    get(identifier, cb) {
        User.findById(identifier, cb);
    }
    getByUsername(username, cb) {
        User.findOne({
            username: username
        }, cb);
    }
}
