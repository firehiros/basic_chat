import axios from 'axios';

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
