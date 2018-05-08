import { store } from './index';
import authActions from './reducers/auth/actions';

export default () =>
    new Promise(() => {
        store.dispatch(authActions.checkAuthorization());
    });
