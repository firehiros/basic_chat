
'use strict';

const _ = require('lodash');
const util = require('util');
const EventEmitter  = require('events');

const FileHandler   = require('./file');
const FileConfig    = require('./../config').files;
const User          = require('./../db/schema/user');
const File          = require('./../db/schema/file');
const Room          = require('./../db/schema/room');

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

module.exports = class FileController extends EventEmitter {
    constructor(){
        super();
        this.fileHandler = new FileHandler(FileConfig.local);
    }
    create(options, cb) {
        if (!FileConfig.enabled) {
            return cb('Files are disabled.');
        }
        if (FileConfig.restrictTypes &&
            FileConfig.allowedTypes &&
            FileConfig.allowedTypes.length &&
            !_.includes(FileConfig.allowedTypes, options.file.mimetype)) {
                return cb('The MIME type ' + options.file.mimetype +
                          ' is not allowed');
        }

        Room.findById(options.room, (err, room) => {

            if (err) {
                console.error(err);
                return cb(err);
            }
            if (!room) {
                return cb('Room does not exist.');
            }
            if (room.archived) {
                return cb('Room is archived.');
            }
            if (!room.isAuthorized(options.owner)) {
                return cb('Not authorized.');
            }

            new File({
                owner: options.owner,
                name: options.file.originalname,
                type: options.file.mimetype,
                size: options.file.size,
                room: options.room
            }).save((err, savedFile) => {
                if (err) {
                    return cb(err);
                }

                this.fileHandler.save({file: options.file, doc: savedFile}, (err) => {
                    if (err) {
                        savedFile.remove();
                        return cb(err);
                    }

                    User.findOne(options.owner, (err, user) => {
                        if (err) {
                            console.error(err);
                            return cb(err);
                        }

                        cb(null, savedFile, room, user);

                        this.emit('files:new', savedFile, room, user);

                        if (options.post) {
                            MessageController.create({
                                room: room,
                                owner: user.id,
                                text: 'upload://' + savedFile.url
                            });
                        }
                    });
                });
            });
        });
    };

    list(options, cb) {
        var Room = mongoose.model('Room');

        if (!FileConfig.enabled) {
            return cb(null, []);
        }

        options = options || {};

        if (!options.room) {
            return cb(null, []);
        }

        options = sanitizeQuery(options, {
            defaults: {
                reverse: true,
                take: 500
            },
            maxTake: 5000
        });

        var File = mongoose.model('File');

        var findQuery = File.find({
            room: options.room
        });

        if (options.from) {
            findQuery.where('uploaded').gt(options.from);
        }

        if (options.to) {
            findQuery.where('uploaded').lte(options.to);
        }

        if (options.expand) {
            var includes = options.expand.replace(/\s/, '').split(',');

            if (_.includes(includes, 'owner')) {
                findQuery.populate('owner', 'id username displayName email avatar');
            }
        }

        if (options.skip) {
            findQuery.skip(options.skip);
        }

        if (options.reverse) {
            findQuery.sort({ 'uploaded': -1 });
        } else {
            findQuery.sort({ 'uploaded': 1 });
        }

        Room.findById(options.room, (err, room) => {
            if (err) {
                console.error(err);
                return cb(err);
            }

            var opts = {
                userId: options.userId,
                password: options.password
            };

            room.canJoin(opts, (err, canJoin) => {
                if (err) {
                    console.error(err);
                    return cb(err);
                }

                if (!canJoin) {
                    return cb(null, []);
                }

                findQuery.limit(options.take)
                    .exec(function(err, files) {
                        if (err) {
                            console.error(err);
                            return cb(err);
                        }
                        cb(null, files);
                    });
            });
        });
    };

    getUrl(file) {
        if (!FileConfig.enabled) {
            return;
        }

        return this.fileHandler.getUrl(file);
    };
}
