const express       = require('express');
const bodyParser    = require('body-parser');
const axios         = require('axios');
const mongoose      = require('mongoose');

const User          = require('./../db/schema/user');
const Room          = require('./../db/schema/room');
const config        = require('./../config');

let userInfo, pToken;
describe('TEST ROOM API', () => {
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
                username: 'room',
                email: 'room@gmail.com',
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
    beforeEach((next) => {
        axios.post('http://localhost:8000/account/authenticate', {
            username: "room",
            password: "12345678a"
        }).then((response) => {
            expect(response.status).toBe(201);
            userInfo = response.data.user;
            pToken = response.data.token
            next();
        })
    });

    it(`Create room`, async () => {
        // Create room
        let data = {
            name: 'Room Test 01',
            slug: 'room001',
            description: 'This is Test room'
        }
        response = await axios.post('http://localhost:8000/rooms', data ,{
            headers: {
                'x-access-token': pToken
            }
        }).catch((error) => console.log(error));

        let room = response.data;
        expect(response.status).toBe(200);
        expect(room.owner).toBe(userInfo.id);
        expect(room.name).toBe(data.name);
        expect(room.slug).toBe(data.slug);
        expect(room.description).toBe(data.description);

        // Check room is exist
        response = await axios.get('http://localhost:8000/rooms',{
            headers: {
                'x-access-token': pToken
            }
        }).catch((error) => console.log(error))
        expect(response.status).toBe(200);

        let rooms = response.data;
        rooms.forEach((r) => {
            if(r.id === room.id){
                expect(r.name).toBe(room.name);
                expect(r.slug).toBe(room.slug);
                expect(r.description).toBe(room.description);
                expect(r.owner).toBe(room.owner);
            }
        });

        response = await axios.get(`http://localhost:8000/rooms/${room.id}`,{
            headers: {
                'x-access-token': pToken
            }
        }).catch((error) => console.log(error))
        expect(response.status).toBe(200);
        let r = response.data;
        expect(r.name).toBe(room.name);
        expect(r.slug).toBe(room.slug);
        expect(r.description).toBe(room.description);
        expect(r.owner).toBe(room.owner);
    });

    it(`Update room`, async () => {
        // Create room
        let data = {
            name: 'Room Test 02',
            slug: 'room002',
            description: 'This is Test room'
        }
        response = await axios.post('http://localhost:8000/rooms', data, {
            headers: {
                'x-access-token': pToken
            }
        })
        expect(response.status).toBe(200);

        response = await axios.put(`http://localhost:8000/rooms/${response.data.id}`, {
            name: `Room's name is modified`,
            slug: 'room002',
            description: 'Description is modified'
        },{
            headers: {
                'x-access-token': pToken
            }
        })
        let room = response.data;
        expect(response.status).toBe(200);
        expect(room.owner).toBe(userInfo.id);
        expect(room.name).toBe(`Room's name is modified`);
        expect(room.slug).toBe(data.slug);
        expect(room.description).toBe('Description is modified');

    });
    it(`Delete room`, async () => {
        // Create room
        let data = {
            name: 'Room Test 03',
            slug: 'room003',
            description: 'This is Test room'
        }
        response = await axios.post('http://localhost:8000/rooms', data, {
            headers: {
                'x-access-token': pToken
            }
        })
        expect(response.status).toBe(200);

        // Delete room
        response = await axios.delete(`http://localhost:8000/rooms/${response.data.id}`,{
            headers: {
                'x-access-token': pToken
            }
        })
        let room = response.data;
        expect(response.status).toBe(204);

    });
});
// .catch((error) => console.log(error))
