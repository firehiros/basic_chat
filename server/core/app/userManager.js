
'use strict';

const EventEmitter = require('events');
const util = require('util');

module.exports = class UserManager extends EventEmitter {
    constructor(options){
        super();
        this.rooms = {};
    }
    get(roomId) {
        roomId = roomId.toString();
        return this.rooms[roomId];
    }
    slug(slug) {
        return _.find(this.rooms, function(room) {
            return room.roomSlug === slug;
        });
    }
    getOrAdd(room) {
        var roomId = room._id.toString();
        var pRoom = this.rooms[roomId];
        if (!pRoom) {
            pRoom = this.rooms[roomId] = new Room({
                room: room
            });
            pRoom.on('user_join', this.onJoin);
            pRoom.on('user_leave', this.onLeave);
        }
        return pRoom;
    }
    onJoin(data) {
        this.emit('user_join', data);
    }
    onLeave(data) {
        this.emit('user_leave', data);
    }
    usernameChanged(data) {
        Object.keys(this.rooms).forEach(function(key) {
            this.rooms[key].usernameChanged(data);
        }, this);
    }
    removeConnection(connection) {
        Object.keys(this.rooms).forEach(function(key) {
            this.rooms[key].removeConnection(connection);
        }, this);
    }
}
