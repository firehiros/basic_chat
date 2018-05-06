import axios from 'axios';
import io from 'socket.io-client';

var apiUrl = 'http://localhost:3000';

export const login = async (param) => {
    let {indentifier, password} = param;
    return await axios.post(`${apiUrl}/account/authenticate`, {
        indentifier,
        password,
    })
    .catch(err => err)
}

export const register = async (param) => {
    let {username, email, password, passwordConfirm, firstname, lastname} = param;
    return await axios.post(`${apiUrl}/account/register`, {
        username,
        email,
        password,
        passwordConfirm,
        firstname,
        lastname
    })
    .catch(err => err);
}

export const getUsers = async (token) => {
    return await axios.get(`${apiUrl}/users`, {
        headers: {
            'x-access-token': token
        }
    })
    .catch(err => err);
}

export const connectSocket = (param) => {
    let ioOptions = {
        forceNew: true,
        reconnection: false,
        query: {
            token: param.token
        }
    }
    // connect two io clients
    const socket = io('http://localhost:3000', ioOptions);
    return new Promise(resolve => {
        socket.on('connect', () => {
            resolve(socket);
        });
    });
}
