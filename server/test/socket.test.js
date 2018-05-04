const express       = require('express');
const bodyParser    = require('body-parser');
const axios         = require('axios');
const mongoose      = require('mongoose');
const socket            = require('socket.io-client');
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

        mongoose.connect(config.db, function(err) {
            if (err) {
                throw err;
            }

            // Create User
            axios.post('http://localhost:8000/account/register', {
                username: 'fred',
                email: 'fred@gmail.com',
                password: '12345678a',
                passwordConfirm: '12345678a'
            }).then((response) => {
                expect(response.status).toBe(201);
                next();
            });
        });

    });
    afterAll((next) => {
        mongoose.connection.dropDatabase().then(next)
        // Drop all exist user
        // User.collection.drop()

        // // Drop all user collections
        // User.collection.drop()
    });
    beforeEach(function(){
        let ioOptions = {
            forceNew: true,
            reconnection: false
        }

        // connect two io clients
        sender = socket('http://localhost:8000/', ioOptions)
        sender.on('connect', function () {
            expect(sender.id).toBeDefined();
            done();
        });

    })
    afterEach(function(done){

        // disconnect io clients after each test
        sender.disconnect()
        // receiver.disconnect()
        done()
    })
    it(`Connect to socket`, async () => {
        let response = await axios.post('http://localhost:8000/account/authenticate', {
            username: "fred",
            password: "12345678a"
        })
        let token = response.data.token;
        // sender.emit('connection', {
        //     token: token
        // })
    });

});
// .catch((error) => console.log(error))
