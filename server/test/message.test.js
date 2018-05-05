'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const axios         = require('axios');
const mongoose      = require('mongoose');
const socket        = require('socket.io-client');
const User          = require('./../db/schema/user');
const Room          = require('./../db/schema/room');
const config        = require('./../config');

let sender, receiver,
    senderInfo, receiverInfo,
    senderToken, receiverToken,
    pRoom;
describe('TEST MESSAGE API', () => {
    beforeAll((next) => {
        mongoose.connection.on('error', function (err) {
            throw new Error(err);
        });

        mongoose.connection.on('disconnected', function() {
            throw new Error('Could not connect to database');
        });

        mongoose.connect(config.db, async (err) => {
            if (err) {
                throw err;
            }

            // Create User
            await axios.post('http://localhost:8000/account/register', {
                username: 'message',
                email: 'message@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            })

            await axios.post('http://localhost:8000/account/register', {
                username: 'message1',
                email: 'message1@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            })

            // Get token
            let response = await axios.post('http://localhost:8000/account/authenticate', {
                username: "message",
                password: "12345678a"
            });
            senderToken = response.data.token;
            senderInfo = response.data.user;

            response = await axios.post('http://localhost:8000/account/authenticate', {
                username: "message1",
                password: "12345678a"
            });
            receiverToken = response.data.token;
            receiverInfo = response.data.user;

            // Create room
            let data = {
                name: 'Room Test 01',
                slug: 'msgroom_001',
                description: 'This is Test room'
            }

            response = await axios.post('http://localhost:8000/rooms', data ,{
                headers: {
                    'x-access-token': senderToken
                }
            });
            pRoom = response.data;
            expect(response.status).toBe(200);

            next();
        });

    });
    afterAll((next) => {
        mongoose.connection.dropDatabase().then(next)
    });
    beforeEach(() => {

        let ioOptions = {
            forceNew: true,
            reconnection: false,
            query: {
                token: senderToken
            }
        }
        // connect socket
        sender = socket('http://localhost:8000/', ioOptions);

        // connect socket
        ioOptions.query.token = receiverToken;
        receiver = socket('http://localhost:8000/', ioOptions);

        sender.on('connect', function () {
            expect(sender.id).toBeDefined();
        });
        receiver.on('connect', function () {
            expect(receiver.id).toBeDefined();
        });
    });
    afterEach(() => {
        sender.disconnect()
        receiver.disconnect()
    });

    it(`Send message to room By API`, async (next) => {
        // Receiver Join room
        receiver.emit('rooms:join', {
            room: pRoom.id
        }, function(room) {
            expect(room.owner).toBe(senderInfo.id);
            expect(room.name).toBe('Room Test 01');
            expect(room.slug).toBe('msgroom_001');
            expect(room.description).toBe('This is Test room');
        });

        receiver.on('messages:new', (message) => {
            expect(message.text).toBe('This is message send by api');
            next();
        })
        // Send message to room
        let message = {
            room: pRoom.id,
            text: 'This is message send by api'
        }
        axios.post(`http://localhost:8000/messages`, message, {
            headers: {
                'x-access-token': sender.query.token
            }
        }).then((response) => {
            expect(response.status).toBe(201);
        });
    });

    it(`Send message to room By Socket`, async (next) => {
        // Receiver Join room
        receiver.emit('rooms:join', {
            room: pRoom.id
        }, function(room) {
            expect(room.owner).toBe(senderInfo.id);
            expect(room.name).toBe('Room Test 01');
            expect(room.slug).toBe('msgroom_001');
            expect(room.description).toBe('This is Test room');
        });

        receiver.on('messages:new', (message) => {
            expect(message.text).toBe('This is message send By socket');
            next();
        })
        // Send message to room
        let message = {
            room: pRoom.id,
            text: 'This is message send By socket'
        }
        sender.emit('messages:create', message, function(msg) {
            expect(msg.owner).toBe(senderInfo.id);
            expect(msg.room).toBe(message.room);
            expect(msg.text).toBe(message.text);
        });
    });

});
