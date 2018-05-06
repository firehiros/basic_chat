import createHistory from 'history/createHashHistory';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';

import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';

import reducers from './reducers';
import rootSaga from './reducers/sagas';
import logger from 'redux-logger'

const history = createHistory();
const sagaMiddleware = createSagaMiddleware.default();
const routeMiddleware = routerMiddleware(history);
const middlewares = [thunk, sagaMiddleware, routeMiddleware, logger];

const store = createStore(
    reducers,
    compose(applyMiddleware(...middlewares))
);

sagaMiddleware.run(rootSaga);
export { store, history };
