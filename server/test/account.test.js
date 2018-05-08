const express       = require('express');
const bodyParser    = require('body-parser');
const axios         = require('axios');
const mongoose      = require('mongoose');

const User          = require('./../db/schema/user');
const config        = require('./../config');

const HOST          = "http://localhost:8000";
describe('TEST ACCOUNT API', () => {
    beforeAll(() => {
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
        });

    });
    afterAll((next) => {
        mongoose.connection.dropDatabase().then(next)
        // Drop all exist user
        // User.collection.drop()

        // // Drop all user collections
        // User.collection.drop()
    });

    it(`Account Register`, (next) => {
        axios.post(`${HOST}/account/register`, {
            username: 'test',
            email: 'test@gmail.com',
            password: '12345678a',
            passwordConfirm: '12345678a'
        }).then((response) => {
            expect(response.status).toBe(201);
            User.findOne({
                username: response.data.user.username
            }, function(err, user) {
                expect(err).toBe(null);
                expect(user.username).toBe('test');
                expect(user.email).toBe('test@gmail.com');
                next();
            })
        })
    });

    it(`Create Account duplicate Register`, async (next) => {
        await axios.post(`${HOST}/account/register`, {
            username: 'duplicate',
            email: 'duplicate@gmail.com',
            password: '12345678a',
            passwordConfirm: '12345678a'
        })
        axios.post(`${HOST}/account/register`, {
            username: 'duplicate',
            email: 'duplicate@gmail.com',
            password: '12345678a',
            passwordConfirm: '12345678a'
        }).catch(function (error) {
            expect(error.response.status).toBe(400);
            next();
        });
    });

    it(`Create account with password wrong format`, (next) => {
        axios.post(`${HOST}/account/register`, {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '12345',
            passwordConfirm: '12345'
        }).catch(function (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("There were problems creating user");
            next();
        });
    });

    it(`Create account with email wrong format`, (next) => {
        axios.post(`${HOST}/account/register`, {
            username: 'fred',
            email: 'fredgmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a'
        }).catch(function (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("There were problems creating user");
            expect(error.response.data.error.errors.email.message).toBe("Invalid email address");
            next();
        });
    });

    it(`Create account with password not confirmed`, (next) => {
        axios.post(`${HOST}/account/register`, {
            username: 'fred',
            email: 'fredgmail.com',
            password: '123456678a',
            passwordConfirm: '1'
        }).catch(function (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Password not confirmed");
            next();
        });
    });

    it(`Account authenticate with username`, async (next) => {
        // Create User
        let responseInfo = await axios.post(`${HOST}/account/register`, {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a'
        })

        axios.post(`${HOST}/account/authenticate`, {
            username: "fred",
            password: "123456678a",
        }).then((response) => {
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            next();
        }).catch(function (error) {
            console.log(error);
            next();
        });
    });

    it(`Account authenticate with email`, async (next) => {
        // Create User
        let responseInfo = await axios.post(`${HOST}/account/register`, {
            username: 'fred1',
            email: 'fred1@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a'
        });

        axios.post(`${HOST}/account/authenticate`, {
            email: "fred1@gmail.com",
            password: "123456678a",
        }).then((response) => {
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            next();
        })
    });

    it(`Account authenticate with wrong username`, async (next) => {
        // Create User
        let responseInfo = await axios.post(`${HOST}/account/register`, {
            username: 'fred2',
            email: 'fred2@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a'
        });

        axios.post(`${HOST}/account/authenticate`, {
            username: "frdsa",
            password: "123456678a",
        }).catch(function (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.success).toBe(false);
            expect(error.response.data.message).toBe("Authentication failed. User not found");
            next();
        });
    });

    it(`Account Information`, async (next) => {
        // Create User
        let response = await axios.post(`${HOST}/account/register`, {
            username: 'fred3',
            email: 'fred3@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a',
            firstname: 'albert',
            lastname: 'fred',
            avatar: 'http://test_avatar.jpg',
        });

        let result = await axios.get(`${HOST}/account/profile`, {
            headers: {
                'x-access-token': response.data.token
            }
        }).then((response) => {
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.user.username).toBe('fred3');
            expect(response.data.user.firstName).toBe('albert');
            expect(response.data.user.lastName).toBe('fred');
            expect(response.data.user.avatar).toBe('http://test_avatar.jpg');
            next();
        })
    });

    it(`Update Profile`, async (next) => {
        // Create User
        let response = await axios.post(`${HOST}/account/register`, {
            username: 'fred4',
            email: 'fred4@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a',
            firstname: 'albert',
            lastname: 'fred',
            avatar: 'http://test_avatar.jpg',
        })

        let result = await axios.post(`${HOST}/account/update`, {
            username: 'fred4',
            email: 'fred4@gmail.com',
            password: '123456678a',
            newPassword: '123456abcd',
            passwordConfirm: '123456abcd',
            firstname: 'albertUpdated',
            lastname: 'fredUpdated',
            avatar: 'http://test_avatar.jpg',
        }, {
            headers: {
                'x-access-token': response.data.token
            }
        })

        axios.get(`${HOST}/account/profile`, {
            headers: {
                'x-access-token': result.data.token
            }
        }).then((response) => {
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.user.username).toBe('fred4');
            expect(response.data.user.firstName).toBe('albertUpdated');
            expect(response.data.user.lastName).toBe('fredUpdated');
            expect(response.data.user.avatar).toBe('http://test_avatar.jpg');
            next();
        })
    });
});
