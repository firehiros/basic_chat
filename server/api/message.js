'use strict';

const MessageController    = require('./../core').MessageController;
const AppManager        = require('./../core').AppManager;

module.exports = function() {

    let app = this.app;
    let authMiddlewares = this.middlewares['auth'];
    let roomMiddlewares = this.middlewares['room'];

    MessageController.on('messages:new', function(message, room, user) {
        var msg = message.toJSON();
        msg.owner = user;
        msg.room = room.toJSON(user);
        app.io.to(room.id).emit('messages:new', {
            success: true,
            message: msg
        });
    });

    //
    // Routes
    //
    app.route('/messages')
        .all(authMiddlewares.verifyToken)
        .get(function(req) {
            req.io.route('messages:list');
        })
        .post(function(req) {
            req.io.route('messages:create');
        });

    app.route('/rooms/:room/messages')
        .all(authMiddlewares.verifyToken, roomMiddlewares)
        .get(function(req) {
            req.io.route('messages:list');
        })
        .post(function(req) {
            req.io.route('messages:create');
        });

    //
    // Sockets
    //
    app.io.route('messages', {
        create: function(req, res) {
            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
            var options = {
                    owner: userId,
                    room: req.param('room'),
                    text: req.param('text')
                };

            MessageController.create(options, function(err, message) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems creating new message',
                        error: err
                    });
                }
                res.status(201).json({
                    success: true,
                    message: message
                });
            });
        },
        list: function(req, res) {

            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
            var options = {
                    userId: userId,
                    password: req.param('password'),

                    room: req.param('room'),
                    since_id: req.param('since_id'),
                    from: req.param('from'),
                    to: req.param('to'),
                    query: req.param('query'),
                    reverse: req.param('reverse'),
                    skip: parseInt(req.param('skip')),
                    take: parseInt(req.param('take')),
                    expand: req.param('expand')
                };

            MessageController.list(options, function(err, messages) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems listing messages',
                        error: err
                    });
                }

                messages = messages.map(function(message) {
                    return message.toJSON(req.user);
                });

                res.status(200).json({
                    success: true,
                    messages: messages
                });
            });
        }
    });

};
