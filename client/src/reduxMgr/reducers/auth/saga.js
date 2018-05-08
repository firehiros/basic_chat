import { all, takeEvery, put, fork, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { getToken, clearToken } from 'helpers/utility';
import actions from './actions';

import {
    login, register, verifyToken,　
    connectSocket, socketState, socketFail
} from 'api/index';

const fakeApiCall = true; // auth0 or express JWT

function* loginRequest() {
    yield takeEvery(actions.LOGIN_REQUEST, function*(param) {
        try {
            let res = yield call(
                login,
                param.payload
            )
            res = res.response ? res.response : res;
            switch(res.status) {
                case 200:
                case 201:

                    localStorage.setItem('user_token', res.data.token);
                    yield put(actions.loginSuccess(res.data))
                    break;
                case 400:
                    yield put(actions.loginFail({
                        status: res.status,
                        message: res.data.message
                    }))
                    break;
                case 401:
                    yield put(actions.loginFail({
                        status: res.status,
                        message: 'Your username or password is not correct'
                    }))
                    break;
                case 403:
                    yield put(actions.loginFail({
                        status: res.status,
                        message: 'Your account is locked'
                    }))
                    break;
                default:
                    yield put(actions.loginFail({
                        status: res.status,
                        message: 'An error has occured'
                    }))
                    break;
            }
        } catch(error){
            yield put(actions.loginFail({
                status: 400,
                message: error.message
            }))
        }
    });
}

function* registerRequest() {
    yield takeEvery(actions.REGISTER_REQUEST, function*(param) {
        try {
            let res = yield call(
                register,
                param.payload
            )

            res = res.response ? res.response : res;
            switch(res.status) {
                case 200:
                case 201:
                    yield put(push('/'));
                    break;
                case 400:
                    yield put(actions.registerFail({
                        status: res.status,
                        message: res.data.message,
                        error: res.data.error
                    }))
                    break;
                default:
                    yield put(actions.registerFail({
                        status: res.status,
                        message: 'An error has occured'
                    }))
                    break;
            }
        } catch(error){
            yield put(actions.registerFail({
                status: 400,
                message: error.message
            }))
        }
    });
}

function* verifyTokenRequest() {
    yield takeEvery(actions.VERIFY_TOKEN_REQUEST, function*(param) {
        try {
            let res = yield call(
                verifyToken,
                param.payload.token
            )

            res = res.response ? res.response : res;
            switch(res.status) {
                case 200:
                case 201:
                    yield put(actions.loginSuccess(res.data))
                    break;
                case 400:
                    yield put(actions.loginFail({
                        status: res.status,
                        message: res.data.message,
                        error: res.data.error
                    }))
                    break;
                default:
                    yield put(actions.loginFail({
                        status: res.status,
                        message: 'An error has occured'
                    }))
                    break;
            }
        } catch(error){
            yield put(actions.registerFail({
                status: 400,
                message: error.message
            }))
        }
    });
}

function* connectSocketRequest() {
    yield takeEvery(actions.CONNECT_SOCKET, function*(payload) {
        try {
            let socket = yield call(
                connectSocket,
                payload.param
            );
            yield put(actions.socketState(socket))
        } catch(error){
            yield put(actions.socketFail({
                status: 400,
                message: error
            }))
        }
    });
}

function* logout() {
    yield takeEvery(actions.LOGOUT, function*() {
        clearToken();
        yield put(push('/'));
    });
}
function* checkAuthorization() {
    yield takeEvery(actions.CHECK_AUTHORIZATION, function*() {
        const token = getToken().get('userToken');
        if (token) {
            yield put(actions.verifyToken({
                token
            }));
            yield put(actions.connectSocket(token));
        }
    });
}
export default function* rootSaga() {
    yield all([
        fork(checkAuthorization),
        fork(loginRequest),
        fork(registerRequest),
        fork(verifyTokenRequest),
        fork(connectSocketRequest),
        fork(logout)
    ]);
}
