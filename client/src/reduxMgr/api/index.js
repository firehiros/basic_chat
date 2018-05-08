import axios from 'axios';
import io from 'socket.io-client';
import {HOST} from 'constants/config';

var apiUrl = 'http://localhost:3000';

export const login = async (param) => {
    let {indentifier, password} = param;
    return await axios.post(`${HOST}/account/authenticate`, {
        indentifier,
        password,
    }).catch(error => error.response)
}

export const register = async (param) => {
    let {username, email, password, passwordConfirm, firstname, lastname} = param;
    console.log(param);
    return await axios.post(`${HOST}/account/register`, {
        username,
        email,
        password,
        passwordConfirm,
        firstname,
        lastname
    }).catch(error => error.response)
}
export const verifyToken = async (token) => {
    return await axios.post(`${HOST}/account/verifyToken`, {
        token
    }).catch(error => error.response)
}

export const loadConversation = async (params) => {
    return await axios.get(`${HOST}/users/${params.chatuser}/messages`, {
        params: params,
        headers: {
            'x-access-token': params.token
        }
    }).catch(error => error.response)
}

export const getUsers = async (token) => {
    return await axios.get(`${HOST}/users`, {
        headers: {
            'x-access-token': token
        }
    }).catch(error => error.response)
}

export const submitComment = async (param) => {
    return await axios.post(`${HOST}/users/${param.chatuser}/messages`, {text: param.text},{
        headers: {
            'x-access-token': param.token
        }
    }).catch(error => error.response)
}

export const connectSocket = (param) => {
    let ioOptions = {
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionDelayMax: 1000,
        timeout: 3000,
        query: {
            token: param
        }
    }
    // connect two io clients
    const socket = io(`${HOST}`, ioOptions);
    return new Promise((resolve, reject) => {
        socket.on('connect', () => {
            resolve(socket);
        });
        socket.on('error', (error) => {
            reject(error);
        });
    });
}
