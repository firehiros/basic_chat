'use strict';

const _ = require('lodash');
const util = require('util');
const Room          = require('./../db/schema/room');
const User          = require('./../db/schema/user');

const EventEmitter = require('events');
// const helpers = require('./helpers');
let sanitizeQuery = (query, options) => {
    if (options.defaults.take && !query.take) {
        query.take = options.defaults.take;
    }
    if (options.maxTake < query.take) {
        query.take = options.maxTake;
    }

    if (typeof query.reverse === 'string') {
        query.reverse = query.reverse.toLowerCase() === 'true';
    }

    if (typeof query.reverse === 'undefined') {
        query.reverse = options.defaults.reverse;
    }

    return query;
}

// util.inherits(RoomController, EventEmitter);

module.exports = class RoomController extends EventEmitter {
    constructor(){
        super();
    }
    createRoom(options, cb) {
        Room.create(options, (err, room) => {
            if (err) {
                return cb(err);
            }

            if (cb) {
                room = room;
                cb(null, room);
                this.emit('rooms:new', room);
            }
        });
    }

    getParticipants (room, options, cb) {
        if (!room.private || !options.participants) {
            return cb(null, []);
        }

        let participants = [];

        if (Array.isArray(options.participants)) {
            participants = options.participants;
        }

        if (typeof options.participants === 'string') {
            participants = options.participants.replace(/@/g, '')
                .split(',').map((username) => {
                    return username.trim();
                });
        }

        participants = _.chain(participants)
            .map((username) => {
                return username && username.replace(/@,\s/g, '').trim();
            })
            .filter((username) => { return !!username; })
            .uniq()
            .value();

        User.find({
            username: { $in: participants }
        }, cb);
    }
    updateRoom (roomId, options, cb) {
        Room.findById(roomId, (err, room) => {
            if (err) {
                // Oh noes, a bad thing happened!
                console.error(err);
                return cb(err);
            }

            if (!room) {
                return cb('Update room is not exist');
            }

            if(room.private && !room.owner.equals(options.userId)) {
                return cb('Only owner can change room.');
            }

            this.getParticipants(room, options, (err, participants) => {
                if (err) {
                    // Oh noes, a bad thing happened!
                    console.error(err);
                    return cb(err);
                }

                room.name = options.name;
                // DO NOT UPDATE SLUG
                // room.slug = options.slug;
                room.description = options.description;

                if (room.private) {
                    room.password = options.password;
                    room.participants = participants;
                }

                room.save((err, room) => {
                    if (err) {
                        console.error(err);
                        return cb(err);
                    }
                    room = room;
                    cb(null, room);
                    this.emit('rooms:update', room);
                });
            });
        });
    }
    canJoin(options, cb) {
        let method = options.id ? 'getRoomById' : 'getRoomBySlug';
        let roomId = options.id ? options.id : options.slug;

        this[method](roomId, (err, room) => {
            if (err) {
                return cb(err);
            }

            if (!room) {
                return cb();
            }

            room.canJoin(options, (err, canJoin) => {
                cb(err, room, canJoin);
            });
        });
    }
    archive(roomId, cb) {
        Room.findById(roomId, (err, room) => {
            if (err) {
                console.error(err);
                return cb(err);
            }

            if (!room) {
                return cb('Room does not exist.');
            }

            room.archived = true;
            room.save((err, room) => {
                if (err) {
                    console.error(err);
                    return cb(err);
                }
                cb(null, room);
                this.emit('rooms:archive', room);

            });
        });
    }
    listRooms(options, cb) {
        options = options || {};

        options = sanitizeQuery(options, {
            defaults: {
                take: 500
            },
            maxTake: 5000
        });

        let findQuery = Room.find({
            archived: { $ne: true },
            $or: [
                {private: {$exists: false}},
                {private: false},

                {owner: options.userId},

                {participants: options.userId},

                {password: {$exists: true, $ne: ''}}
            ]
        });

        if (options.skip) {
            findQuery.skip(options.skip);
        }

        if (options.take) {
            findQuery.limit(options.take);
        }

        if (options.sort) {
            let sort = options.sort.replace(',', ' ');
            findQuery.sort(sort);
        } else {
            findQuery.sort('-lastActive');
        }

        findQuery.populate('participants');

        findQuery.exec((err, rooms) => {
            if (err) {
                return cb(err);
            }

            _.each(rooms, (room) => {
                this.sanitizeRoom(options, room);
            });

            if (options.users && !options.sort) {
                rooms = _.sortBy(rooms, ['userCount', 'lastActive'])
                         .reverse();
            }

            cb(null, rooms);

        });
    }
    getRoomById(options, cb) {
        var identifier;

        if (typeof options === 'string') {
            identifier = options;
            options = {};
            options.identifier = identifier;
        } else {
            identifier = options.identifier;
        }

        options.criteria = {
            _id: identifier,
            archived: { $ne: true }
        };

        this.findOne(options, cb);
    }
    getRoomBySlug(options, cb) {
        var identifier;

        if (typeof options === 'string') {
            identifier = options;
            options = {};
            options.identifier = identifier;
        } else {
            identifier = options.identifier;
        }

        options.criteria = {
            slug: identifier,
            archived: { $ne: true }
        };

        this.findOne(options, cb);
    }
    findOne(options, cb) {
        Room.findOne(options.criteria)
            .populate('participants').exec((err, room) => {

            if (err) {
                return cb(err);
            }
            if (!room) {
                return cb(null, null);
            }
            this.sanitizeRoom(options, room);
            cb(err, room);

        });
    }
    sanitizeRoom(options, room) {
        var authorized = options.userId && room.isAuthorized(options.userId);

        if (options.users) {
            if (authorized) {
                // TODO private room
                // room.users = this.core.presence.getUsersForRoom(room.id.toString());
            } else {
                room.users = [];
            }
        }
    }
}
