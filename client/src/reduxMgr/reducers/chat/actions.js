import {
    FILTER_USERS,
    ON_HIDE_LOADER,
    ON_SELECT_USER,
    ON_TOGGLE_DRAWER,
    SUBMIT_COMMENT,
    UPDATE_MESSAGE_VALUE,
    USER_INFO_STATE,
    REQUEST_CONNECT,
    REQUEST_USERS,
    REQUEST_USERS_SUCCESS,
    REQUEST_USERS_FAIL,
    REQUEST_CONVERSATION,
    REQUEST_CONVERSATION_SUCCESS,
    REQUEST_CONVERSATION_FAIL
} from "constants/ActionTypes";

const actions = {
    requestConnect: (param) => ({
        type: REQUEST_CONNECT,
        payload: param
    }),
    requestUsers: (param) => ({
        type: REQUEST_USERS,
        payload: param
    }),
    requestUsersSuccess: (payload) => ({
        type: REQUEST_USERS_SUCCESS,
        payload
    }),
    requestUsersError: (error) => ({
        type: REQUEST_USERS_FAIL,
        error
    }),
    requestConversation: (param) => ({
        type: REQUEST_CONVERSATION,
        payload: param
    }),
    requestConversationSuccess: (payload) => ({
        type: REQUEST_CONVERSATION_SUCCESS,
        payload
    }),
    requestConversationFail: (error) => ({
        type: REQUEST_CONVERSATION_FAIL,
        error
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
};
export default actions;
