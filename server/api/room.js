'use strict';

// var settings = require('./../config').rooms;
const User              = require('./../db/schema/user');
const Room              = require('./../db/schema/room');
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
            var connections = AppManager.connectionManager.getConnections({
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
            let userId = user ? (user._id || user.userId || user) : req.userId;
            let options = {
                userId: userId,
                users: req.param('users'),
                skip: req.param('skip'),
                take: req.param('take')
            };

            RoomController.listRooms(options, function(err, rooms) {
                if (err) {
                    console.error(err);
                    return res.status(400).json(err);
                }

                let results = rooms.map(function(room) {
                    return room.toJSON(req.user);
                });

                res.json(results);
            });
        },
        get: function(req, res, user) {
            let userId = user ? (user._id || user.userId || user) : req.userId;

            let options = {
                userId: userId,
                identifier: req.param('room') || req.param('id') || req.param('slug')
            };
            RoomController.getRoomById(options, function(err, room) {
                if (err) {
                    console.error(err);
                    return res.status(400).json(err);
                }

                if (!room) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Room not found.',
                        error: err
                    });
                }

                res.json(room.toJSON(req.user));
            });
        },
        create: function(req, res) {
            let user = req.userId;
            let options = {
                owner: user,
                name: req.param('name'),
                slug: req.param('slug'),
                description: req.param('description'),
                private: req.param('private'),
                password: req.param('password')
            };

            RoomController.createRoom(options, function(err, room) {
                if (err) {
                    console.error(err);
                    return res.status(400).json(err);
                }

                res.json(room.toJSON(user));
            });
        },
        update: function(req, res) {
            var roomId = req.param('room') || req.param('id');

            var options = {
                name: req.param('name'),
                slug: req.param('slug'),
                description: req.param('description'),
                password: req.param('password'),
                participants: req.param('participants'),
                userId: req.userId
            };
            RoomController.updateRoom(roomId, options, function(err, room) {
                if (err) {
                    return res.status(400).json(err);
                }

                if (!room) {
                    return res.sendStatus(404);
                }

                res.json(room.toJSON(req.userId));
            });
        },
        archive: function(req, res) {
            var roomId = req.param('room') || req.param('id');

            RoomController.archive(roomId, function(err, room) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400);
                }

                if (!room) {
                    return res.sendStatus(404);
                }

                res.sendStatus(204);
            });
        },
        join: function(req, res) {
            var options = {
                userId: req.userId
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
                    return res.sendStatus(400);
                }

                if (!room) {
                    return res.sendStatus(404);
                }

                if(!canJoin && room.password) {
                    return res.status(403).json({
                        status: 'error',
                        roomName: room.name,
                        message: 'password required',
                        errors: 'password required'
                    });
                }

                if(!canJoin) {
                    return res.sendStatus(404);
                }

                var user = req.user.toJSON();
                user.room = room._id;

                core.presence.join(req.socket.conn, room);
                req.socket.join(room._id);
                res.json(room.toJSON(req.user));
            });
        },
        leave: function(req, res) {
            var roomId = req.data;
            var user = req.user.toJSON();
            user.room = roomId;

            core.presence.leave(req.socket.conn, roomId);
            req.socket.leave(roomId);
            res.json();
        },
        users: function(req, res) {
            var roomId = req.param('room');

            RoomController.get(roomId, function(err, room) {
                if (err) {
                    console.error(err);
                    return res.sendStatus(400);
                }

                if (!room) {
                    return res.sendStatus(404);
                }

                var users = core.presence.rooms
                        .getOrAdd(room)
                        .getUsers()
                        .map(function(user) {
                            // TODO: Do we need to do this?
                            user.room = room.id;
                            return user;
                        });

                res.json(users);
            });
        }
    });
};
