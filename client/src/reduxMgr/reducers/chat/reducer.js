import Moment from 'moment';
// import users from './data/chatUsers';
// import conversationList from './data/conversationList';
import actions from './actions';
import {
    ON_HIDE_LOADER,
    ON_SELECT_USER,
    ON_TOGGLE_DRAWER,
    SUBMIT_COMMENT,
    UPDATE_MESSAGE_VALUE,
    UPDATE_SEARCH_CHAT_USER,
    USER_INFO_STATE,
    REQUEST_USERS_SUCCESS,
    REQUEST_USERS_ERROR,
    REQUEST_CONVERSATION_SUCCESS,
    REQUEST_CONVERSATION_ERROR
} from "constants/ActionTypes";


const initState = {
    loader: false,
    userNotFound: 'No user found',
    drawerState: false,
    selectedSectionId: '',
    userState: 1,
    searchChatUser: '',
    selectedUser: null,
    message: '',
    chatUsers: [],
    conversation: null,
    error: null
};

export default function chatReducer(state = initState, action) {

    switch (action.type) {
        case REQUEST_USERS_SUCCESS:
            console.log(action);
            return {
                ...state,
                chatUsers: action.payload
            }
        case REQUEST_USERS_ERROR:
            return {
                ...state,
                error: action.error
            }
        case REQUEST_CONVERSATION_SUCCESS:
            return {
                ...state,
                conversation: action.payload.token
            }
        case REQUEST_CONVERSATION_ERROR:
            return {
                ...state,
                error: action.error
            }
        case ON_SELECT_USER: {
            return {
                ...state,
                loader: true,
                drawerState: false,
                selectedSectionId: action.payload.id,
                selectedUser: action.payload,
                conversation: state.conversationList.find((data) => data.id === action.payload.id)
            }
        }
        case ON_TOGGLE_DRAWER: {
            return {
                ...state,
                drawerState: !state.drawerState
            }
        }
        case ON_HIDE_LOADER: {
            return {
                ...state,
                loader: false
            }
        }
        case USER_INFO_STATE: {
            return {
                ...state,
                userState: action.payload
            }
        }

        case SUBMIT_COMMENT: {
            const updatedConversation = state.conversation.conversationData.concat({
                'type': 'sent',
                'message': state.message,
                'sentAt': Moment(new Date).format('ddd DD, YYYY, hh:mm:ss A'),
            });

            return {
                ...state,
                conversation: {
                    ...state.conversation, conversationData: updatedConversation
                },
                message: '',
                conversationList: state.conversationList.map(conversationData => {
                    if (conversationData.id === state.conversation.id) {
                        return {...state.conversation, conversationData: updatedConversation};
                    } else {
                        return conversationData;
                    }
                })

            }
        }

        case UPDATE_MESSAGE_VALUE: {
            return {...state, message: action.payload}
        }
        default:
            return state;
    }
}
