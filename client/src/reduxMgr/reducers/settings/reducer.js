import {FIXED_DRAWER, DRAWER_TYPE, TOGGLE_COLLAPSED_NAV} from 'constants/ActionTypes';
import actions, { getView } from './actions';

const initState = {
    navCollapsed: false,
    drawerType: FIXED_DRAWER
};

export default function appReducer(state = initState, action) {
    switch (action.type) {
        case '@@router/LOCATION_CHANGE':
            return {
                ...state,
                navCollapsed: false
            };
        case TOGGLE_COLLAPSED_NAV:
            return {
                ...state,
                navCollapsed: action.isNavCollapsed
            };
        case DRAWER_TYPE:
            return {
                ...state,
                drawerType: action.drawerType
            };
        default:
            return state;
    }
    return state;
}
