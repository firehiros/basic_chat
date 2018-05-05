'use strict';

const _                 = require('lodash');
const config            = require('./../config');

const AppManager        = require('./../core').AppManager;
const ChatController    = require('./../core').ChatController;

module.exports = function() {

    let app = this.app;
    let authMiddlewares = this.middlewares['auth'];

    ChatController.on('chat-messages:new', function(message) {
        _.each(message.users, function(userId) {
            var connections = AppManager.system.connections.getConnections({
                type: 'socket.io', userId: userId.toString()
            });
            _.each(connections, function(connection) {
                // console.log(connection.socket);
                connection.socket.emit('chat-messages:new', message);
            });
        });
    });

    //
    // Routes
    //

    app.route('/users/:user/messages')
        .all(authMiddlewares.verifyToken)
        .get(function(req) {
            req.io.route('chat-messages:list');
        })
        .post(function(req) {
            req.io.route('chat-messages:create');
        });
    //
    // Sockets
    //
    app.io.route('chat-messages', {
        create: function(req, res) {
            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
            let options = {
                owner: userId,
                user: req.param('user'),
                text: req.param('text')
            };

            ChatController.create(options, function(err, message) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400);
                }
                res.status(201).json(message);
            });
        },
        list: function(req, res) {
            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
            var options = {
                currentUser: userId,
                user: req.param('user'),
                since_id: req.param('since_id'),
                from: req.param('from'),
                to: req.param('to'),
                reverse: req.param('reverse'),
                skip: req.param('skip'),
                take: req.param('take'),
                expand: req.param('expand')
            };

            ChatController.list(options, function(err, messages) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400);
                }
                res.json(messages);
            });
        }
    });

};
