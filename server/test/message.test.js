'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const axios         = require('axios');
const mongoose      = require('mongoose');
const socket        = require('socket.io-client');
const User          = require('./../db/schema/user');
const Room          = require('./../db/schema/room');
const config        = require('./../config');

const HOST          = "http://localhost:8000";

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
            await axios.post(`${HOST}/account/register`, {
                username: 'message',
                email: 'message@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            })

            await axios.post(`${HOST}/account/register`, {
                username: 'message1',
                email: 'message1@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            })

            // Get token
            let response = await axios.post(`${HOST}/account/authenticate`, {
                username: "message",
                password: "12345678a"
            });
            senderToken = response.data.token;
            senderInfo = response.data.user;

            response = await axios.post(`${HOST}/account/authenticate`, {
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

            axios.post(`${HOST}/rooms`, data ,{
                headers: {
                    'x-access-token': senderToken
                }
            }).then((response) => {
                pRoom = response.data.room;
                expect(response.status).toBe(201);
                next();
            });

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
        sender = socket(`${HOST}`, ioOptions);

        // connect socket
        ioOptions.query.token = receiverToken;
        receiver = socket(`${HOST}`, ioOptions);

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
        }, function(res) {
            expect(res.room.owner).toBe(senderInfo.id);
            expect(res.room.name).toBe('Room Test 01');
            expect(res.room.slug).toBe('msgroom_001');
            expect(res.room.description).toBe('This is Test room');
            next();
        });

        receiver.on('messages:new', (res) => {
            expect(res.message.text).toBe('This is message send by api');
            next();
        })
        // Send message to room
        let message = {
            room: pRoom.id,
            text: 'This is message send by api'
        }
        axios.post(`${HOST}/messages`, message, {
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
        }, function(res) {
            expect(res.room.owner).toBe(senderInfo.id);
            expect(res.room.name).toBe('Room Test 01');
            expect(res.room.slug).toBe('msgroom_001');
            expect(res.room.description).toBe('This is Test room');
        });

        receiver.on('messages:new', (res) => {
            expect(res.message.text).toBe('This is message send By socket');
            next();
        })
        // Send message to room
        let message = {
            room: pRoom.id,
            text: 'This is message send By socket'
        }
        sender.emit('messages:create', message, function(res) {
            expect(res.message.owner).toBe(senderInfo.id);
            expect(res.message.room).toBe(message.room);
            expect(res.message.text).toBe(message.text);
        });
    });

});
