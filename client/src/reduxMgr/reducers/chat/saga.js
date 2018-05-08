import { all, takeEvery, put, fork, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { getToken, clearToken } from 'helpers/utility';
import actions from './actions';
import { eventChannel } from 'redux-saga';

import {
    login, logout, register,
    connectSocket, getUsers, loadConversation,
    submitComment
 } from 'api/index';

function* requestUsers() {
    yield takeEvery(actions.REQUEST_USERS, function*(param) {
        try {
            let res = yield call(
                getUsers,
                param.payload
            )

            res = res.response ? res.response : res;
            switch(res.status) {
                case 200:
                case 201:
                    yield put(actions.requestUsersSuccess(res.data))
                    break;
                case 400:
                    yield put(actions.requestUsersError({
                        status: res.status,
                        message: res.data.message,
                        error: res.data.error
                    }))
                    break;
                default:
                    yield put(actions.requestUsersError({
                        status: res.status,
                        message: 'An error has occured'
                    }))
                    break;
            }
        } catch(error){
            yield put(actions.requestUsersError({
                status: 400,
                message: error.message
            }))
        }
    });
}
function* requestConversation() {
    yield takeEvery(actions.REQUEST_CONVERSATION, function*(param) {
        try {
            let res = yield call(
                loadConversation,
                param.payload
            )

            res = res.response ? res.response : res;
            switch(res.status) {
                case 200:
                case 201:
                    yield put(actions.requestConversationSuccess(res.data))
                    break;
                case 400:
                    yield put(actions.requestConversationFail({
                        status: res.status,
                        message: res.data.message,
                        error: res.data.error
                    }))
                    break;
                default:
                    yield put(actions.requestConversationFail({
                        status: res.status,
                        message: res.data.message
                    }))
                    break;
            }
        } catch(error){
            yield put(actions.requestConversationFail({
                status: 400,
                message: error.message
            }))
        }
    });
}
function* submitCommentRequest() {
    yield takeEvery(actions.SUBMIT_COMMENT, function*(param) {
        try {
            let res = yield call(
                submitComment,
                param.payload
            )

            res = res.response ? res.response : res;
            switch(res.status) {
                case 200:
                case 201:
                    yield put(actions.submitCommentSuccess(res.data))
                    break;
                case 400:
                    yield put(actions.submitCommentFail({
                        status: res.status,
                        message: res.data.message,
                        error: res.data.error
                    }))
                    break;
                default:
                    yield put(actions.submitCommentFail({
                        status: res.status,
                        message: res.data.message
                    }))
                    break;
            }
        } catch(error){
            yield put(actions.submitCommentFail({
                status: 400,
                message: error.message
            }))
        }
    });
}

export default function* rootSaga() {
    yield all([
        fork(requestUsers),
        fork(requestConversation),
        fork(submitCommentRequest)
    ]);
}
