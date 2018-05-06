import {DRAWER_TYPE, TOGGLE_COLLAPSED_NAV} from 'constants/ActionTypes';

const actions = {
    toggleCollapsedNav : (isNavCollapsed) => {
        return {
            type: TOGGLE_COLLAPSED_NAV,
            isNavCollapsed
        };
    },

    setDrawerType : (drawerType) =>  {
        return {
            type: DRAWER_TYPE,
            drawerType
        };
    }
};
export default actions;
