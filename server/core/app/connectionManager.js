'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class ConnectionManager extends EventEmitter {
    constructor(type, user){
        super();
        this.connections = {};

        this.get = this.get.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.getUserIds = this.getUserIds.bind(this);
        this.getUsernames = this.getUsernames.bind(this);

        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.removeAll = this.removeAll.bind(this);
    }
    get(connectionId) {
        return this.connections[connectionId];
    }
    contains(connection) {
        if (!connection) {
            return false;
        }

        return !!this.connections[connection.id];
    }
    getUsers(filter) {
        var connections = this.connections;

        if (filter) {
            connections = this.getConnections(filter);
        }

        return _.chain(connections)
                .filter(function(value) {
                    return !!value.user;
                })
                .map(function(value) {
                    return value.user;
                })
                .uniq('id')
                .value();

    }
    getUserIds(filter) {
        var users = this.getUsers(filter);

        return _.map(users, function(user) {
            return user.id;
        });
    }
    getUsernames(filter) {
        var users = this.getUsers(filter);

        return _.map(users, function(user) {
            return user.username;
        });
    }
    getConnections(options) {
        if (options.userId) {
            options.userId = options.userId.toString();
        }
        return _.map(this.connections, function(value) {
            return value;
        }).filter(function(conn) {
            var result = true;

            if (options.user) {
                var u = options.user;
                if (conn.user && conn.user.id !== u && conn.user.username !== u) {
                    result = false;
                }
            }

            if (options.userId && conn.user && conn.user.id !== options.userId) {
                result = false;
            }

            if (options.type && conn.type !== options.type) {
                result = false;
            }

            return result;
        });
    }
    add(connection) {
        this.connections[connection.id] = connection;
    }
    remove(connection) {
        if (!connection) {
            return;
        }

        var connId = typeof connection === 'string' ? connection : connection.id;
        if (this.connections[connId]) {
            delete this.connections[connId];
            return true;
        } else {
            return false;
        }
    }
    removeAll() {
        var keys = Object.keys(this.connections);

        keys.forEach(function(key) {
            delete this.connections[key];
        }, this);

        return true;
    }
}
