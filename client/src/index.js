import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { store, history } from './reduxMgr';
import AppRoutes from './router';

// import ReduxMgr from './ReduxMgr';
let render = () => {
    ReactDOM.render(
        <Provider store={store}>
            <AppRoutes history={history} />
        </Provider>,
        document.getElementById('app-site')
    );

};

render();
