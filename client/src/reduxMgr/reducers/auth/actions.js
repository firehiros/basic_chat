const actions = {
    CHECK_AUTHORIZATION: 'CHECK_AUTHORIZATION',
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGOUT: 'LOGOUT',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_ERROR: 'LOGIN_ERROR',
    REGISTER_REQUEST: 'REGISTER_REQUEST',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_ERROR: 'REGISTER_ERROR',
    checkAuthorization: () => ({
        type: actions.CHECK_AUTHORIZATION
    }),
    login: (param) => ({
        type: actions.LOGIN_REQUEST,
        payload: param
    }),
    loginSuccess: (payload) => ({
        type: actions.LOGIN_SUCCESS,
        payload
    }),
    loginError: (error) => ({
        type: actions.LOGIN_ERROR,
        error
    }),
    logout: () => ({
        type: actions.LOGOUT
    }),
    register: (param) => ({
        type: actions.REGISTER_REQUEST,
        payload: param
    }),
    registerSuccess: (payload) => ({
        type: actions.REGISTER_SUCCESS,
        payload
    }),
    registerError: (error) => ({
        type: actions.REGISTER_ERROR,
        error
    }),
    authenticate: (param) => ({
        type: actions.CHECK_AUTHORIZATION,
        payload: param
    })
};
export default actions;
