'use strict';

const socket = require('./socket');
const account = require('./account');
const room = require('./room');
const chat = require('./chat');
const message = require('./message');
const file = require('./file');
const user = require('./user');

module.exports = {
    account: account,
    room: room,
    socket: socket,
    chat: chat,
    message: message,
    file: file,
    user: user
}
