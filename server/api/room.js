'use strict';

// var settings = require('./../config').rooms;
const User              = require('./../db/schema/user');
const RoomController    = require('./../core').RoomController;
const AppManager        = require('./../core').AppManager;

module.exports = function() {
    const app = this.app;
    const authMiddlewares = this.middlewares['auth'];
    const roomMiddlewares = this.middlewares['room'];

    AppManager.on('system:user_join', function(data) {
        User.findById(data.userId, function (err, user) {
            if (!err && user) {
                user = user.toJSON();
                user.room = data.roomId;
                if (data.roomHasPassword) {
                    app.io.to(data.roomId).emit('users:join', user);
                } else {
                    app.io.emit('users:join', user);
                }
            }
        });
    });

    AppManager.on('system:user_leave', function(data) {
        User.findById(data.userId, function (err, user) {
            if (!err && user) {
                user = user.toJSON();
                user.room = data.roomId;
                if (data.roomHasPassword) {
                    app.io.to(data.roomId).emit('users:leave', user);
                } else {
                    app.io.emit('users:leave', user);
                }
            }
        });
    });

    var getEmitters = function(room) {
        if (room.private && !room.hasPassword) {
            var connections = AppManager.system.connections.getConnections({
                type: 'socket.io'
            }).filter(function(connection) {
                return room.isAuthorized(connection.user);
            });

            return connections.map(function(connection) {
                return {
                    emitter: connection.socket,
                    user: connection.user
                };
            });
        }

        return [{
            emitter: app.io
        }];
    };

    RoomController.on('rooms:new', function(room) {
        var emitters = getEmitters(room);
        emitters.forEach(function(e) {
            e.emitter.emit('rooms:new', room.toJSON(e.user));
        });
    });

    RoomController.on('rooms:update', function(room) {
        var emitters = getEmitters(room);
        emitters.forEach(function(e) {
            e.emitter.emit('rooms:update', room.toJSON(e.user));
        });
    });

    RoomController.on('rooms:archive', function(room) {
        var emitters = getEmitters(room);
        emitters.forEach(function(e) {
            e.emitter.emit('rooms:archive', room.toJSON(e.user));
        });
    });


    //
    // Routes
    //
    app.route('/rooms')
        .all(authMiddlewares.verifyToken)
        .get(function(req) {
            req.io.route('rooms:list');
        })
        .post(function(req) {
            req.io.route('rooms:create');
        });

    app.route('/rooms/:room')
        .all(authMiddlewares.verifyToken, roomMiddlewares)
        .get(function(req) {
            req.io.route('rooms:get');
        })
        .put(function(req) {
            req.io.route('rooms:update');
        })
        .delete(function(req) {
            req.io.route('rooms:archive');
        });

    app.route('/rooms/:room/users')
        .all(authMiddlewares.verifyToken, roomMiddlewares)
        .get(function(req) {
            req.io.route('rooms:users');
        });


    //
    // Sockets
    //
    app.io.route('rooms', {
        list: function(req, res, user) {
            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
            let options = {
                userId: userId,
                users: req.param('users'),
                skip: req.param('skip'),
                take: req.param('take')
            };

            RoomController.listRooms(options, function(err, rooms) {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems listing rooms',
                        error: err
                    });
                }

                let results = rooms.map(function(room) {
                    return room.toJSON(req.user);
                });
                res.status(200).json({
                    success: true,
                    rooms: results
                });
            });
        },
        get: function(req, res) {
            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;

            let options = {
                userId: userId,
                identifier: req.param('room') || req.param('id') || req.param('slug')
            };
            RoomController.getRoomById(options, function(err, room) {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems getting room',
                        error: err
                    });
                }

                if (!room) {
                    return res.status(404).json({
                        success: false,
                        message: 'Room not found.',
                        error: err
                    });
                }
                res.status(200).json({
                    success: true,
                    room: room.toJSON(req.user)
                });
            });
        },
        create: function(req, res) {
            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
            let options = {
                owner: userId,
                name: req.param('name'),
                slug: req.param('slug'),
                description: req.param('description'),
                private: req.param('private'),
                password: req.param('password')
            };

            RoomController.createRoom(options, function(err, room) {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems creating rooms',
                        error: err
                    });
                }
                res.status(201).json({
                    success: true,
                    room: room.toJSON(req.user)
                });
            });
        },
        update: function(req, res) {
            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
            var roomId = req.param('room') || req.param('id');

            var options = {
                name: req.param('name'),
                slug: req.param('slug'),
                description: req.param('description'),
                password: req.param('password'),
                participants: req.param('participants'),
                userId: userId
            };
            RoomController.updateRoom(roomId, options, function(err, room) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems updating room',
                        error: err
                    });
                }

                if (!room) {
                    return res.status(404).json({
                        success: false,
                        message: 'Room not found'
                    });
                }
                res.status(200).json({
                    success: true,
                    room: room.toJSON(req.user)
                });
            });
        },
        archive: function(req, res) {
            var roomId = req.param('room') || req.param('id');

            RoomController.archive(roomId, function(err, room) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems archiving rooms',
                        error: err
                    });
                }

                if (!room) {
                    return res.status(404).json({
                        success: false,
                        message: 'Room not found'
                    });
                }
                res.status(204).json({
                    success: true
                });
            });
        },
        join: function(req, res) {
            let userId = req.user ? (req.user._id || req.user.userId || req.user) : null;
            var options = {
                userId: userId
            };

            if (typeof req.data === 'string') {
                options.id = req.data;
            } else {
                options.id = req.param('room') || req.param('id');
                options.password = req.param('password');
            }

            RoomController.canJoin(options, function(err, room, canJoin) {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems joining rooms',
                        error: err
                    });
                }

                if (!room) {
                    return res.status(404).json({
                        success: false,
                        message: 'Room not found'
                    });
                }

                if(!canJoin && room.password) {
                    return res.status(403).json({
                        success: false,
                        roomName: room.name,
                        message: 'password required'
                    });
                }

                if(!canJoin) {
                    return res.status(404).json({
                        success: false,
                        message: 'Can not join room'
                    });;
                }

                var user = req.user.toJSON();
                user.room = room._id;

                AppManager.join(req.socket.conn, room);
                req.socket.join(room._id);

                res.status(200).json({
                    success: true,
                    room: room.toJSON(req.user)
                });
            });
        },
        leave: function(req, res) {
            var roomId = req.data;
            var user = req.user.toJSON();
            user.room = roomId;

            AppManager.leave(req.socket.conn, roomId);
            req.socket.leave(roomId);
            res.status(200).json({
                success: true
            });
        },
        users: function(req, res) {
            var roomId = req.param('room');

            RoomController.get(roomId, function(err, room) {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        success: false,
                        message: 'There were problems getting users',
                        error: err
                    });
                }

                if (!room) {
                    return res.status(404).json({
                        success: false,
                        message: 'Room not found'
                    });
                }

                var users = AppManager.roomManager
                        .getOrAdd(room)
                        .getUsers()
                        .map(function(user) {
                            // TODO: Do we need to do this?
                            user.room = room.id;
                            return user;
                        });

                res.status(200).json({
                    success: true,
                    users: users
                });
            });
        }
    });
};
