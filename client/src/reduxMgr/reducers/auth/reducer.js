import { Map } from 'immutable';
import actions from './actions';

const initState = {
    userToken: null,
    error: null
};


export default function authReducer(state = initState, action) {
    switch (action.type) {
        case actions.LOGIN_SUCCESS:
            return {
                ...state,
                userToken: action.payload.token
            }
        case actions.LOGIN_ERROR:
            return {
                ...state,
                error: action.error
            }
        case actions.REGISTER_SUCCESS:
            console.log(action);
            return {
                ...state,
                userToken: action.payload.token
            }
        case actions.REGISTER_ERROR:
            return {
                ...state,
                error: action.error
            }
        case actions.LOGOUT:
            return initState;
        default:
            return state;
    }
}
