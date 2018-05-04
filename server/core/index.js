const RoomController = require('./roomController');
const AppManager = require('./app/manager');

module.exports = {
    RoomController: new RoomController(),
    AppManager: new AppManager()
}
