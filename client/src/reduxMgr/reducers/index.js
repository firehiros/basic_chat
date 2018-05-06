import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import AuthReducer from './auth/reducer';
import SettingReducer from './settings/reducer';
import ChatReducer from './chat/reducer';


const reducers = combineReducers({
    routing: routerReducer,
    auth: AuthReducer,
    setting: SettingReducer,
    chat: ChatReducer
});

export default reducers;
