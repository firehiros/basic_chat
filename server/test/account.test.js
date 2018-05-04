const express       = require('express');
const bodyParser    = require('body-parser');
const axios         = require('axios');
const mongoose      = require('mongoose');

const User          = require('./../db/schema/user');
const config        = require('./../config');

describe('TEST Account API', () => {
    beforeEach(() => {
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
    afterEach((next) => {
        mongoose.connection.dropDatabase().then(next)
        // Drop all exist user
        // User.collection.drop()

        // // Drop all user collections
        // User.collection.drop()
    });

    it(`Account Register`, (next) => {
        axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '12345678a',
            passwordConfirm: '12345678a'
        }).then((response) => {
            expect(response.status).toBe(201);
            User.findOne({
                username: response.data.user.username
            }, function(err, user) {
                expect(err).toBe(null);
                expect(user.username).toBe('fred');
                expect(user.email).toBe('fred@gmail.com');

                // // Delete created user
                // User.collection.drop();
                next();
            })
        })
    });

    it(`Create Account duplicate Register`, async (next) => {
        await axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '12345678a',
            passwordConfirm: '12345678a'
        })
        axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '12345678a',
            passwordConfirm: '12345678a'
        }).catch(function (error) {
            expect(error.response.status).toBe(400);
            next();
        });
    });

    it(`Create account with password wrong format`, (next) => {
        axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '12345',
            passwordConfirm: '12345'
        }).catch(function (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Sorry, we could not process your request.");
            expect(error.response.data.error.errors.password.message).toBe("Minimum eight characters, at least one letter and one number");
            next();
        });
    });

    it(`Create account with email wrong format`, (next) => {
        axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fredgmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a'
        }).catch(function (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Sorry, we could not process your request.");
            expect(error.response.data.error.errors.email.message).toBe("Invalid email address");
            next();
        });
    });

    it(`Create account with password not confirmed`, (next) => {
        axios.post('http://localhost:8000/account/register', {
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
        let responseInfo = await axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a'
        })

        axios.post('http://localhost:8000/account/authenticate', {
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
        let responseInfo = await axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a'
        });

        axios.post('http://localhost:8000/account/authenticate', {
            email: "fred@gmail.com",
            password: "123456678a",
        }).then((response) => {
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            next();
        })
    });

    it(`Account authenticate with wrong username`, async (next) => {
        // Create User
        let responseInfo = await axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a'
        });

        axios.post('http://localhost:8000/account/authenticate', {
            username: "fred1",
            password: "123456678a",
        }).catch(function (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.success).toBe(false);
            expect(error.response.data.message).toBe("Authentication failed. User not found.");
            next();
        });
    });

    it(`Account Information`, async (next) => {
        // Create User
        let response = await axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a',
            firstname: 'albert',
            lastname: 'fred',
            avatar: 'http://test_avatar.jpg',
        });

        let result = await axios.get('http://localhost:8000/account/profile', {
            headers: {
                'x-access-token': response.data.token
            }
        }).then((response) => {
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.user.username).toBe('fred');
            expect(response.data.user.firstName).toBe('albert');
            expect(response.data.user.lastName).toBe('fred');
            expect(response.data.user.avatar).toBe('http://test_avatar.jpg');
            next();
        })
    });

    it(`Update Profile`, async (next) => {
        // Create User
        let response = await axios.post('http://localhost:8000/account/register', {
            username: 'fred',
            email: 'fred@gmail.com',
            password: '123456678a',
            passwordConfirm: '123456678a',
            firstname: 'albert',
            lastname: 'fred',
            avatar: 'http://test_avatar.jpg',
        })

        let result = await axios.post('http://localhost:8000/account/update', {
            username: 'fred',
            email: 'fred@gmail.com',
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

        axios.get('http://localhost:8000/account/profile', {
            headers: {
                'x-access-token': result.data.token
            }
        }).then((response) => {
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.user.username).toBe('fred');
            expect(response.data.user.firstName).toBe('albertUpdated');
            expect(response.data.user.lastName).toBe('fredUpdated');
            expect(response.data.user.avatar).toBe('http://test_avatar.jpg');
            next();
        })
    });
});
