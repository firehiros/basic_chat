import {FIXED_DRAWER} from 'constants/config';
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
        case action.TOGGLE_COLLAPSED_NAV:
            return {
                ...state,
                navCollapsed: action.isNavCollapsed
            };
        case action.DRAWER_TYPE:
            return {
                ...state,
                drawerType: action.drawerType
            };
        default:
            return state;
    }
    return state;
}
