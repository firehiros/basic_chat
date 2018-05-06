'use strict';

const mongoose = require('mongoose');

const Core = require('./../core');
const Connection = require('./../core/app/connection');

class SocketConnection extends Connection {
    constructor(user, socket){
        super('socket.io', user)
        this.socket = socket;
        socket.conn = this;
        this.disconnect = this.disconnect.bind(this);
        socket.on('disconnect', this.disconnect);
    }

    disconnect() {
        this.emit('disconnect');
        this.socket.conn = null;
        this.socket = null;
    }
}
module.exports = function() {
    const app = this.app;
    app.io.use(function (socket, next) {
        if (socket.request._query && socket.request._query.token) {
            let User = mongoose.model('User');
            User.findByToken(socket.request._query.token, function(err, user) {
                if (err || !user) {
                    return next(new Error('Authentication error'));
                }

                socket.request.user = user;
                socket.request.user.loggedIn = true;
                socket.request.user.usingToken = true;
                next();
            });
        }
    });

    app.io.on('connection', function(socket) {
        let userId = socket.request.user._id;
        let User = mongoose.model('User');
        User.findById(userId, function (err, user) {
            if (err) {
                console.error(err);
                return;
            }
            let conn = new SocketConnection(user, socket);
            Core.AppManager.connect(conn);
        });
    });
};
