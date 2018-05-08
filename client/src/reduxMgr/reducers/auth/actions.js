const actions = {
    CHECK_AUTHORIZATION: 'CHECK_AUTHORIZATION',
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGOUT: 'LOGOUT',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAIL: 'LOGIN_FAIL',
    REGISTER_REQUEST: 'REGISTER_REQUEST',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAIL: 'REGISTER_FAIL',
    VERIFY_TOKEN_REQUEST: 'VERIFY_TOKEN_REQUEST',
    VERIFY_TOKEN_SUCCESS: 'VERIFY_TOKEN_SUCCESS',
    VERIFY_TOKEN_FAIL: 'VERIFY_TOKEN_FAIL',
    CONNECT_SOCKET: 'CONNECT_SOCKET',
    SOCKET_STATE: 'SOCKET_STATE',
    SOCKET_FAIL: 'SOCKET_FAIL',
    DISCONNECT_SOCKET: 'DISCONNECT_SOCKET',
    CLEAR_NOTIFY: 'CLEAR_NOTIFY',
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
    loginFail: (error) => ({
        type: actions.LOGIN_FAIL,
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
    registerFail: (error) => ({
        type: actions.REGISTER_FAIL,
        error
    }),
    verifyToken: (param) => ({
        type: actions.VERIFY_TOKEN_REQUEST,
        payload: param
    }),
    connectSocket: (payload) => ({
        type: actions.CONNECT_SOCKET,
        param: payload
    }),
    socketState: (payload) => ({
        type: actions.SOCKET_STATE,
        payload
    }),
    socketFail: (payload) => ({
        type: actions.SOCKET_FAIL,
        payload
    }),
    disconnectSocket: () => ({
        type: actions.DISCONNECT_SOCKET
    }),
    authenticate: (param) => ({
        type: actions.CHECK_AUTHORIZATION,
        payload: param
    }),
    clearNotify: () => ({
        type: actions.CLEAR_NOTIFY
    })
};
export default actions;
