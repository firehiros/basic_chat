const actions = {
    // Chat Module const
    REQUEST_USERS : 'REQUEST_USERS',
    REQUEST_USERS_SUCCESS : 'REQUEST_USERS_SUCCESS',
    REQUEST_USERS_FAIL : 'REQUEST_USERS_FAIL',
    REQUEST_CONVERSATION : 'REQUEST_CONVERSATION',
    REQUEST_CONVERSATION_SUCCESS : 'REQUEST_CONVERSATION_SUCCESS',
    REQUEST_CONVERSATION_FAIL : 'REQUEST_CONVERSATION_FAIL',
    ON_SELECT_USER : 'ON_SELECT_USER',
    ON_HIDE_LOADER : 'ON_HIDE_LOADER',
    CHANGE_PANEL_STATE : 'CHANGE_PANEL_STATE',
    SUBMIT_COMMENT : 'SUBMIT_COMMENT',
    SUBMIT_COMMENT_SUCCESS : 'SUBMIT_COMMENT_SUCCESS',
    SUBMIT_COMMENT_FAIL : 'SUBMIT_COMMENT_FAIL',
    UPDATE_MESSAGE_VALUE : 'UPDATE_MESSAGE_VALUE',
    UPDATE_SEARCH_CHAT_USER : 'UPDATE_SEARCH_CHAT_USER',
    QUIT_CHAT : 'QUIT_CHAT',
    hideLoader: () => ({
        type: actions.ON_HIDE_LOADER
    }),
    onChatToggleDrawer: () => ({
        type: actions.ON_TOGGLE_DRAWER
    }),
    requestConnect: (param) => ({
        type: actions.REQUEST_CONNECT,
        payload: param
    }),
    requestUsers: (param) => ({
        type: actions.REQUEST_USERS,
        payload: param
    }),
    requestUsersSuccess: (payload) => ({
        type: actions.REQUEST_USERS_SUCCESS,
        payload
    }),
    requestUsersError: (error) => ({
        type: actions.REQUEST_USERS_FAIL,
        error
    }),
    requestConversation: (param, token) => ({
        type: actions.REQUEST_CONVERSATION,
        payload: { ...param, token }
    }),
    requestConversationSuccess: (payload) => ({
        type: actions.REQUEST_CONVERSATION_SUCCESS,
        payload
    }),
    requestConversationFail: (error) => ({
        type: actions.REQUEST_CONVERSATION_FAIL,
        error
    }),
    onSelectUser: (user) => ({
        type: actions.ON_SELECT_USER,
        payload: user
    }),
    submitComment: (param, token) => ({
        type: actions.SUBMIT_COMMENT,
        payload: { ...param, token }
    }),
    submitCommentSuccess: (payload) => ({
        type: actions.SUBMIT_COMMENT_SUCCESS,
        payload
    }),
    submitCommentFail: (error) => ({
        type: actions.SUBMIT_COMMENT_FAIL,
        error
    }),
    changePanelState: (state) => ({
        type: actions.CHANGE_PANEL_STATE,
        payload: state
    }),
    updateMessageValue: (message) => ({
        type: actions.UPDATE_MESSAGE_VALUE,
        payload: message
    }),
    quitChat: () => ({
        type: actions.QUIT_CHAT
    }),
};
export default actions;
