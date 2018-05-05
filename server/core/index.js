'use strict';

const RoomController = require('./roomController');
const UserController = require('./userController');
const ChatController = require('./chatController');
const MessageController = require('./messageController');
const FileController = require('./fileController');
const AppManager = require('./app/manager');

module.exports = {
    RoomController: new RoomController(),
    AppManager: new AppManager(),
    UserController: new UserController(),
    ChatController: new ChatController(),
    MessageController: new MessageController(),
    FileController: new FileController()
}
