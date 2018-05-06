import {
    FILTER_CONTACT,
    FILTER_USERS,
    ON_HIDE_LOADER,
    ON_SELECT_USER,
    ON_TOGGLE_DRAWER,
    SUBMIT_COMMENT,
    UPDATE_MESSAGE_VALUE,
    UPDATE_SEARCH_CHAT_USER,
    USER_INFO_STATE
} from "constants/ActionTypes";


const actions = {
    filterContacts: (userName) => ({
        type: FILTER_CONTACT,
        payload: userName
    }),
    filterUsers: (userName) => ({
        type: FILTER_USERS,
        payload: userName
    }),
    onSelectUser: (user) => ({
        type: ON_SELECT_USER,
        payload: user
    }),
    submitComment: () => ({
        type: SUBMIT_COMMENT
    }),
    hideLoader: () => ({
        type: ON_HIDE_LOADER
    }),
    onChatToggleDrawer: () => ({
        type: ON_TOGGLE_DRAWER
    }),
    onSelectUser: (user) => ({
        type: ON_SELECT_USER,
        payload: user
    }),
    userInfoState: (state) => ({
        type: USER_INFO_STATE,
        payload: state
    }),
    updateMessageValue: (message) => ({
        type: UPDATE_MESSAGE_VALUE,
        payload: message
    }),
    updateSearchChatUser: (userName) => ({
        type: UPDATE_SEARCH_CHAT_USER,
        payload: userName
    }),
};
export default actions;
