'use strict';

const EventEmitter = require('events');
const util = require('util');
const uuid = require('uuid');

module.exports = class Connection extends EventEmitter {
    constructor(type, user){
        super();
        this.type = type;
        this.id = uuid.v4();
        this.user = user;
    }
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            user: this.user
        };
    }
}
