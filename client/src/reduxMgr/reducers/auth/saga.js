import { all, takeEvery, put, fork, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { getToken, clearToken } from 'helpers/utility';
import actions from './actions';

import { login, register } from 'api/index';

const fakeApiCall = true; // auth0 or express JWT

function* loginRequest() {
    yield takeEvery('LOGIN_REQUEST', function*(param) {
        try {
            let res = yield call(
                login,
                param.payload
            )
            res = res.response ? res.response : res;
            switch(res.status) {
                case 200:
                case 201:
                    yield put(actions.loginSuccess(res.data))
                    break;
                case 400:
                    yield put(actions.loginError({
                        status: res.status,
                        message: res.data.message
                    }))
                    break;
                case 401:
                    yield put(actions.loginError({
                        status: res.status,
                        message: 'Your username or password is not correct'
                    }))
                    break;
                case 403:
                    yield put(actions.loginError({
                        status: res.status,
                        message: 'Your account is locked'
                    }))
                    break;
                default:
                    yield put(actions.loginError({
                        status: res.status,
                        message: 'An error has occured'
                    }))
                    break;
            }
        } catch(error){
            yield put(actions.loginError({
                status: 400,
                message: error.message
            }))
        }
    });
}

function* registerRequest() {
    yield takeEvery('REGISTER_REQUEST', function*(param) {
        try {
            let res = yield call(
                register,
                param.payload
            )

            res = res.response ? res.response : res;
            switch(res.status) {
                case 200:
                case 201:
                    yield put(actions.registerSuccess(res.data))
                    break;
                case 400:
                    yield put(actions.registerError({
                        status: res.status,
                        message: res.data.message,
                        error: res.data.error
                    }))
                    break;
                default:
                    yield put(actions.registerError({
                        status: res.status,
                        message: 'An error has occured'
                    }))
                    break;
            }
        } catch(error){
            yield put(actions.registerError({
                status: 400,
                message: error.message
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
        const token = getToken().get('idToken');
        if (token) {
            yield put({
                type: actions.LOGIN_SUCCESS,
                token,
                profile: 'Profile'
            });
        }
    });
}
export default function* rootSaga() {
    yield all([
        fork(checkAuthorization),
        fork(loginRequest),
        fork(registerRequest),
        fork(logout)
    ]);
}
