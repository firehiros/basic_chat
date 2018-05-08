
const actions = {// Customizer const
    TOGGLE_COLLAPSED_NAV : 'TOGGLE_COLLAPSED_NAV',
    DRAWER_TYPE : 'DRAWER_TYPE',
    toggleCollapsedNav : (isNavCollapsed) => {
        return {
            type: actions.TOGGLE_COLLAPSED_NAV,
            isNavCollapsed
        };
    },

    setDrawerType : (drawerType) =>  {
        return {
            type: actions.DRAWER_TYPE,
            drawerType
        };
    }
};
export default actions;
