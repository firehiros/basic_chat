import Moment from 'moment';
// import users from './data/chatUsers';
// import conversationList from './data/conversationList';
import actions from './actions';

const initState = {
    loader: false,
    userNotFound: 'No user found',
    drawerState: false,
    selectedSectionId: '',
    panelState: 1,
    searchChatUser: '',
    selectedUser: null,
    message: '',
    userList: [],
    conversation: [],
    error: null,
    notify: null
};

export default function chatReducer(state = initState, action) {

    switch (action.type) {
        case actions.REQUEST_USERS_SUCCESS:
            return {
                ...state,
                userList: action.payload.users
            }
        case actions.REQUEST_USERS_ERROR:
            return {
                ...state,
                error: action.error
            }
        case actions.ON_SELECT_USER: {
            return {
                ...state,
                selectedSectionId: action.payload.id,
                selectedUser: action.payload
            }
        }
        case actions.REQUEST_CONVERSATION_SUCCESS:
            let conversation = action.payload.messages.map(message => {
                if (message.owner.id === state.selectedUser.id) {
                    message.type = "received"
                }
                return message;
            })
            return {
                ...state,
                loader: true,
                drawerState: false,
                selectedSectionId: action.payload.id,
                conversation: conversation
            }
        case actions.REQUEST_CONVERSATION_FAIL:
            return {
                ...state,
                error: action.error
            }
        case actions.ON_TOGGLE_DRAWER: {
            return {
                ...state,
                drawerState: !state.drawerState
            }
        }
        case actions.ON_HIDE_LOADER: {
            return {
                ...state,
                loader: false
            }
        }
        case actions.CHANGE_PANEL_STATE: {
            return {
                ...state,
                panelState: action.payload
            }
        }

        case actions.SUBMIT_COMMENT_SUCCESS: {
            console.log(actions.SUBMIT_COMMENT_SUCCESS)
            console.log(action.payload)
            let message = action.payload.message;
            if (message.owner === state.selectedUser.id) {
                message.type = "received"
            }
            // state.conversation.push(message);

            return {
                ...state,
                message: '',
                conversation: [
                    ...state.conversation,
                    message
                ]
            }
        }
        case actions.SUBMIT_COMMENT_FAIL:
            return {
                ...state,
                error: action.error
            }
        case actions.QUIT_CHAT:
            return initState;
        case actions.UPDATE_MESSAGE_VALUE: {
            return {...state, message: action.payload}
        }
        case actions.CLEAR_NOTIFY: {
            return {
                ...state,
                notify: null
            }
        }

        default:
            return state;
    }
}
