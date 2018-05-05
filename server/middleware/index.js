module.exports = {
    auth: require('./authMiddleware'),
    room: require('./roomMiddleware'),
    cleanupFiles: require('./cleanupFile'),
}
