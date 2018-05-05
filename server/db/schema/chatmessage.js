
'use strict';

const mongoose = require('mongoose');
const config = require('./../../config');

var ObjectId = mongoose.Schema.Types.ObjectId;

var ChatMessageSchema = new mongoose.Schema({
    users: [{
        type: ObjectId,
        ref: 'User'
    }],
    owner: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    posted: {
        type: Date,
        default: Date.now
    }
});

ChatMessageSchema.index({ users: 1, posted: -1, _id: 1 });

ChatMessageSchema.method('toJSON', function() {
    return {
        id: this._id,
        owner: this.owner,
        text: this.text,
        posted: this.posted
    };
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
