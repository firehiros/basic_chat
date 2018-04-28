var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
    title: {
        type: String, required: true
    },
    connections: {
        type: [
            {
                userId: String,
                socketId: String
            }
        ]
    }
});

var Room = mongoose.model('Room', RoomSchema);
module.exports = Room;
