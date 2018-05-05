'use strict';

const _             = require('lodash');

const EventEmitter  = require('events');
const ChatMessage   = require('./../db/schema/chatmessage');
const User          = require('./../db/schema/user');

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

module.exports = class ChatController extends EventEmitter {
    constructor(){
        super();
    }

    create(options, cb) {
        User.findById(options.user, (err, user) => {
            if (err) {
                console.error(err);
                return cb(err);
            }
            if (!user) {
                return cb('User does not exist.');
            }

            var data = {
                users: [options.owner, options.user],
                owner: options.owner,
                text: options.text
            };

            var message = new ChatMessage(data);

            // Test if this message is OTR
            if (data.text.match(/^\?OTR/)) {
                message._id = 'OTR';
                this.onMessageCreated(message, user, options, cb);
            } else {
                message.save((err) => {
                    if (err) {
                        console.error(err);
                        return cb(err);
                    }
                    this.onMessageCreated(message, user, options, cb);
                });
            }
        });
    }

    onMessageCreated(message, user, options, cb) {

        User.findOne(message.owner, (err, owner) => {
            if (err) {
                console.error(err);
                return cb(err);
            }
            if (cb) {
                cb(null, message, user, owner);
            }

            this.emit('chat-messages:new', message, user, owner, options.data);
        });
    }

    list(options, cb) {
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

        var find = ChatMessage.find({
            users: { $all: [options.currentUser, options.user] }
        });

        if (options.since_id) {
            find.where('_id').gt(options.since_id);
        }

        if (options.from) {
            find.where('posted').gt(options.from);
        }

        if (options.to) {
            find.where('posted').lte(options.to);
        }

        if (options.expand) {
            var includes = options.expand.split(',');

            if (_.includes(includes, 'owner')) {
                find.populate('owner', 'id username displayName email avatar');
            }
        }

        if (options.skip) {
            find.skip(options.skip);
        }

        if (options.reverse) {
            find.sort({ 'posted': -1 });
        } else {
            find.sort({ 'posted': 1 });
        }

        find.limit(options.take)
            .exec(function(err, messages) {
                if (err) {
                    console.error(err);
                    return cb(err);
                }
                cb(null, messages);
            });
    }
}
