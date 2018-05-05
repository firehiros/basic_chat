const socket = require('./socket');
const account = require('./account');
const room = require('./room');
const chat = require('./chat');
const message = require('./message');

module.exports = {
    account: account,
    room: room,
    socket: socket,
    chat: chat,
    message: message
}
