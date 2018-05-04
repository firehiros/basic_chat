
'use strict';

const EventEmitter = require('events');
const ConnectionManager = require('./connectionManager');

module.exports = class Room extends EventEmitter {
    constructor(options){
        super();
        if (options.system) {
            // This is the system room
            // Used for tracking what users are online
            this.system = true;
            this.roomId = undefined;
            this.roomSlug = undefined;
            this.hasPassword = false;
        } else {
            this.system = false;
            this.roomId = options.room._id.toString();
            this.roomSlug = options.room.slug;
            this.hasPassword = options.room.hasPassword;
        }

        this.connections = new ConnectionManager();
        this.userCount = 0;
    }
    getListUsers() {
        return this.connections.getUsers();
    }
    getListUserIds() {
        return this.connections.getUserIds();
    }
    getListUsernames() {
        return this.connections.getUsernames();
    }
    containsUser(userId) {
        return this.getUserIds().indexOf(userId) !== -1;
    }
    emitUserJoin(data) {
        this.userCount++;

        var d = {
            userId: data.userId,
            username: data.username
        };

        if (this.system) {
            d.system = true;
        } else {
            d.roomId = this.roomId;
            d.roomSlug = this.roomSlug;
            d.roomHasPassword = this.hasPassword;
        }

        this.emit('user_join', d);
    }
    emitUserLeave(data) {
        this.userCount--;

        var d = {
            user: data.user,
            userId: data.userId,
            username: data.username
        };

        if (this.system) {
            d.system = true;
        } else {
            d.roomId = this.roomId;
            d.roomSlug = this.roomSlug;
            d.roomHasPassword = this.hasPassword;
        }

        this.emit('user_leave', d);
    }
    handleUsernameChange(data) {
        if (this.containsUser(data.userId)) {
            // User leaving room
            this.emitUserLeave({
                userId: data.userId,
                username: data.oldUsername
            });
            // User rejoining room with new username
            this.emitUserJoin({
                userId: data.userId,
                username: data.username
            });
        }
    }
    addConnection(connection) {
        if (!connection) {
            console.error('Cannot add connection! An invalid connection was detected');
            return;
        }

        if (connection.user && connection.user.id &&
            !this.containsUser(connection.user.id)) {
            // User joining room
            this.emitUserJoin({
                user: connection.user,
                userId: connection.user.id,
                username: connection.user.username
            });
        }
        this.connections.add(connection);
    }
    removeConnection(connection) {
        if (!connection) {
            console.error('Cannot remove connection! An invalid connection was detected');
            return;
        }

        if (this.connections.remove(connection)) {
            if (connection.user && connection.user.id &&
                !this.containsUser(connection.user.id)) {
                // Leaving room altogether
                this.emitUserLeave({
                    user: connection.user,
                    userId: connection.user.id,
                    username: connection.user.username
                });
            }
        }
    }
}
