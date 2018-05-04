
const mongoose = require('mongoose');

const Core = require('./../core');
const Connection = require('./../core/app/connection');

class SocketConnection extends Connection {
    constructor(user, socket){
        super('socket.io', user)
        this.socket = socket;
        socket.conn = this;
    }

    disconnect() {
        this.emit('disconnect');

        this.socket.conn = null;
        this.socket = null;
    }
}
module.exports = function() {
    const app = this.app;
    console.log("RUN SOCKET");
    app.io.use(function (socket, next) {
        console.log("AUTHORIZATION SOCKET");
        let User = mongoose.model('User');
        if (socket.request._query && socket.request._query.token) {
            User.findByToken(socket.request._query.token, function(err, user) {
                if (err || !user) {
                    return next('Fail');
                }

                socket.request.user = user;
                socket.request.user.loggedIn = true;
                socket.request.user.usingToken = true;
                next();
            });
        }
    });

    app.io.on('connection', function(socket) {
        console.log("CONNECTIONS");
        let userId = socket.request.user._id;
        User.findById(userId, function (err, user) {
            if (err) {
                console.error(err);
                return;
            }
            let conn = new SocketIoConnection(user, socket);
            socket.on('disconnect', conn.disconnect);
            Core.AppManager.connect(conn);
        });
    });
};
