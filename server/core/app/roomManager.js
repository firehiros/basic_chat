
'use strict';

const EventEmitter = require('events');

module.exports = class RoomManager extends EventEmitter {
    constructor(options){
        super();
        this.users = {};
    }
    get(userId) {
        return this.users[userId];
    }
    getByUsername(username) {
        return _.find(this.users, function(user) {
            return user.username === username;
        });
    }
    getOrAdd (user) {
        var user2 = typeof user.toJSON === 'function' ? user.toJSON() : user;
        var userId= user2.id.toString();
        if (!this.users[userId]) {
            _.assign(user2, { id: userId });
            this.users[userId] = user2;
            this.core.avatars.add(user);
        }
        return this.users[userId];
    }
    remove(user) {
        user = typeof user.toJSON === 'function' ? user.toJSON() : user;
        var userId = typeof user === 'object' ? user.id.toString() : user;
        delete this.users[userId];
    }
}
