'use strict';

const EventEmitter          = require('events');
const Room                  = require('./room');
const RoomManager           = require('./roomManager');
const UserManager           = require('./userManager');
const ConnectionManager     = require('./connectionManager');

module.exports = class AppManager extends EventEmitter {
    constructor(options){
        super();
        // this.core = options.core;
        this.system = new Room({ system: true });
        this.connectionManager = new ConnectionManager();
        this.roomManager = new RoomManager();
        this.userManager = new UserManager({ core: this.core });
        this.roomManager.on('user_join', this.onJoin.bind(this));
        this.roomManager.on('user_leave', this.onLeave.bind(this));
    }
    getUserCountInRoom(roomId) {
        var room = this.roomManager.get(roomId);
        return room ? room.userCount : 0;
    }
    getUsersInRoom(roomId) {
        var room = this.roomManager.get(roomId);
        return room ? room.getUsers() : [];
    }
    connect(connection) {
        this.system.addConnection(connection);
        this.emit('connect', connection);

        connection.user = this.userManager.getOrAdd(connection.user);

        connection.on('disconnect', () => {
            this.disconnect(connection);
        });
    }
    disconnect(connection) {
        this.system.removeConnection(connection);
        this.emit('disconnect', connection);
        this.roomManager.removeConnection(connection);
    }
    join(connection, room) {
        var pRoom = this.roomManager.getOrAdd(room);
        pRoom.addConnection(connection);
    }
    leave(connection, roomId) {
        var room = this.roomManager.get(roomId);
        if (room) {
            room.removeConnection(connection);
        }
    }
    onJoin(data) {
        this.emit('system:user_join', data);
    }
    onLeave(data) {
        this.emit('system:user_leave', data);
    }
}
