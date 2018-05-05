'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const axios         = require('axios');
const mongoose      = require('mongoose');
const socket        = require('socket.io-client');
const User          = require('./../db/schema/user');
const Room          = require('./../db/schema/room');
const config        = require('./../config');

let sender, receiver;
describe('TEST SOCKET', () => {
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
                username: 'fred',
                email: 'fred@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            })

            await axios.post('http://localhost:8000/account/register', {
                username: 'fred1',
                email: 'fred1@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            })
            next();
        });

    }, 10000);
    afterAll((next) => {
        mongoose.connection.dropDatabase().then(next)
        // Drop all exist user
        // User.collection.drop()

        // // Drop all user collections
        // User.collection.drop()
    });
    beforeEach(function(next){
        // Get token
        axios.post('http://localhost:8000/account/authenticate', {
            username: "fred",
            password: "12345678a"
        }).then((response) => {
            let ioOptions = {
                forceNew: true,
                reconnection: false,
                query: {
                    token: response.data.token
                }
            }
            // connect two io clients
            sender = socket('http://localhost:8000/', ioOptions);
            sender.on('connect', function () {
                sender.user = response.data.user;
                expect(sender.id).toBeDefined();
                next();
            });
            sender.on('error', function (err) {
                console.log(err);
            });

        });

    }, 10000)
    afterEach(function(next){

        // disconnect io clients after each test
        sender.disconnect()
        // receiver.disconnect()
        next()
    })
    it(`Connect to socket`, async (next) => {
        // Get token
        let response = await axios.post('http://localhost:8000/account/authenticate', {
            username: "fred1",
            password: "12345678a"
        });

        let ioOptions = {
            forceNew: true,
            reconnection: false,
            query: {
                token: response.data.token
            }
        }
        // connect two io clients
        let tester = socket('http://localhost:8000/', ioOptions)
        tester.on('connect', function () {
            expect(sender.id).toBeDefined();
            next();
        });
    }, 10000);
    it(`Connect without token`, (next) => {
        let ioOptions = {
            forceNew: true,
            reconnection: false,
            query: {
                token: null
            }
        }
        // connect two io clients
        let tester = socket('http://localhost:8000/', ioOptions);
        tester.on('error', function (err) {
            expect(err).toBe('Authentication error');
            next();
        });
    }, 10000);
    it(`Create Room with socket`, (next) => {
        // Get token
        let data = {
            name: 'Room Test 01',
            slug: 'room001',
            description: 'This is Test room'
        }

        sender.emit('rooms:create', data, function(room) {
            if (room && room.id) {
                expect(room.owner).toBe(sender.user.id);
                expect(room.name).toBe(data.name);
                expect(room.slug).toBe(data.slug);
                expect(room.description).toBe(data.description);
                next();
            }
        });
    }, 10000);
    it(`Join Room with socket`, (next) => {
        // Get token
        let data = {
            name: 'Room Test 02',
            slug: 'room002',
            description: 'This is Test room 2'
        }

        sender.emit('rooms:create', data, function(room) {
            if (room && room.id) {
                sender.on('users:join', function(user) {
                    if (user && user.id) {
                        expect(user.room).toBe(room.id);
                        next();
                    }
                });

                sender.emit('rooms:join', {
                    room: room.id
                }, function(response) {
                    expect(room.owner).toBe(sender.user.id);
                    expect(room.name).toBe(data.name);
                    expect(room.slug).toBe(data.slug);
                    expect(room.description).toBe(data.description);
                    next();
                });
            }
        });

    }, 10000);

    it(`Leave Room with socket`, (next) => {
        // Get token
        let data = {
            name: 'Room Test 03',
            slug: 'room003',
            description: 'This is Test room 3'
        }

        sender.emit('rooms:create', data, function(room) {
            if (room && room.id) {
                // TODO cannot receive users:leave
                // sender.on('users:leave', function(user) {
                //     console.log(user);
                //     next();
                //     if (user && user.id) {
                //         expect(user.room).toBe(room.id);
                //     }
                // });
                sender.emit('rooms:join', {
                    room: room.id
                }, function(response) {
                    expect(room.owner).toBe(sender.user.id);
                    expect(room.name).toBe(data.name);
                    expect(room.slug).toBe(data.slug);
                    expect(room.description).toBe(data.description);

                    sender.emit('rooms:leave', {
                        room: room.id
                    }, function(response) {
                        expect(room.owner).toBe(sender.user.id);
                        expect(room.name).toBe(data.name);
                        expect(room.slug).toBe(data.slug);
                        expect(room.description).toBe(data.description);
                    });
                });
            }
        });

    }, 10000);

});
// .catch((error) => console.log(error))
