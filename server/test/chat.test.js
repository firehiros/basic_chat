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
describe('TEST CHAT API', () => {
    beforeAll((next) => {
        mongoose.connection.on('error', function (err) {
            throw new Error(err);
        });

        mongoose.connection.on('disconnected', function() {
            throw new Error('Could not connect to database');
        });

        mongoose.connect(config.db, async (err) => {
            // remove all
            if (err) {
                throw err;
            }

            // Create User
            let response = await axios.post('http://localhost:8000/account/register', {
                username: 'chat',
                email: 'chat@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            });

            response = await axios.post('http://localhost:8000/account/register', {
                username: 'chat1',
                email: 'chat1@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            });

            // Get token
            response = await axios.post('http://localhost:8000/account/authenticate', {
                username: "chat",
                password: "12345678a"
            })

            senderToken = response.data.token;
            senderInfo = response.data.user;

            response = await axios.post('http://localhost:8000/account/authenticate', {
                username: "chat1",
                password: "12345678a"
            }).catch((error) => console.log(error));
            receiverToken = response.data.token;
            receiverInfo = response.data.user;

            next();
        });

    }, 10000);
    afterAll((next) => {
        mongoose.connection.dropDatabase().then(next);
    });
    beforeEach(async (next) => {
        // Get token
        let ioOptions = {
            forceNew: true,
            reconnection: false,
            query: {
                token: senderToken
            }
        }

        // connect socket
        sender = socket('http://localhost:8000/', ioOptions);
        sender.on('connect', function () {
            expect(sender.id).toBeDefined();
        });

        // connect socket
        ioOptions.query.token = receiverToken;
        receiver = socket('http://localhost:8000/', ioOptions);
        receiver.on('connect', function () {
            expect(receiver.id).toBeDefined();
        });

        next();

    }, 10000)
    afterEach(function(next){
        // disconnect io clients after each test
        sender.disconnect()
        receiver.disconnect()
        next()
    })
    it(`Chat with another user By API`, (next) => {
        let data = {
            text: 'HELLO FRED1'
        }

        axios.post(`http://localhost:8000/users/${receiverInfo.id}/messages`, data,{
            headers: {
                'x-access-token': senderToken
            }
        }).then((response) => {
            expect(response.status).toBe(201);
            expect(response.data.text).toBe('HELLO FRED1');
            next()
        }).catch((error) => console.log(error));
    }, 10000);
    it(`Chat with another user By Socket`, (next) => {
        let data = {
            user: receiverInfo.id,
            text: 'HELLO FRED1'
        }
        receiver.on('chat-messages:new', (message) => {
            expect(message.text).toBe('HELLO FRED1');
            next();
        })
        sender.on('chat-messages:new', (message) => {
            expect(message.text).toBe('HELLO FRED1');
            next();
        })
        sender.emit('chat-messages:create', data, (message) => {
            expect(message.text).toBe('HELLO FRED1');
        });
    }, 10000);

});
