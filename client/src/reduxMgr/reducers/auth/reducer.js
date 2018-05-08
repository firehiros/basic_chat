import { Map } from 'immutable';
import actions from './actions';

const initState = {
    userToken: null,
    userInfo: {},
    socket: null,
    notify: null
};

export default function authReducer(state = initState, action) {
    switch (action.type) {
        case actions.LOGIN_SUCCESS:
            return {
                ...state,
                userToken: action.payload.token,
                userInfo: action.payload.user || initState.userInfo,
            }
        case actions.LOGIN_FAIL:
            return {
                ...state,
                notify: action.error
            }
        // case actions.VERIFY_TOKEN_SUCCESS:
        //     return {
        //         ...state,
        //         userToken: action.payload.token,
        //         userInfo: action.payload.user || initState.userInfo,
        //     }
        // case actions.VERIFY_TOKEN_FAIL:
        //     return {
        //         ...state,
        //         error: action.error
        //     }
        case actions.REGISTER_FAIL:
            return {
                ...state,
                notify: action.error
            }
        case actions.SOCKET_STATE:
            return {
                ...state,
                socket: action.payload
            }
        case actions.SOCKET_FAIL:
            return {
                ...state,
                notify: action.error
            }
        case actions.DISCONNECT_SOCKET:
            return {
                ...state,
                socket: null
            }
        case actions.LOGOUT:
            return initState;
        case actions.CLEAR_NOTIFY:
            return {
                ...state,
                notify: null
            }
        default:
            return state;
    }
}
