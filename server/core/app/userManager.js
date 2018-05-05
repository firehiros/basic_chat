
'use strict';
const _ = require('lodash');
const EventEmitter = require('events');
const util = require('util');

module.exports = class UserManager extends EventEmitter {
    constructor(options){
        super();
        this.users = {};

        this.get = this.get.bind(this);
        this.getOrAdd = this.getOrAdd.bind(this);
        this.remove = this.remove.bind(this);
    }
    get(userId) {
        return this.users[userId];
    }
    getByUsername(username) {
        return _.find(this.users, function(user) {
            return user.username === username;
        });
    }
    getOrAdd(user) {
        user = typeof user.toJSON === 'function' ? user.toJSON() : user;
        let userId = user.id.toString();
        if (!this.users[userId]) {
            _.assign(user, { id: userId });
            this.users[userId] = user;
            // this.core.avatars.add(user);
        }
        return this.users[userId];
    }
    remove(user) {
        user = typeof user.toJSON === 'function' ? user.toJSON() : user;
        let userId = typeof user === 'object' ? user.id.toString() : user;
        delete this.users[userId];
    }
}
