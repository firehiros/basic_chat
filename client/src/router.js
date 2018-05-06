import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { connect } from 'react-redux';

import App from './containers/App';
import asyncComponent from 'helpers/AsyncFunc';
// import Auth0 from './helpers/auth0';

const RestrictedRoute = ({ component: Component, isLoggedIn, ...rest }) => {
    console.log("RENDERRRRRR" + isLoggedIn);
    return (
        <Route
            {...rest}
            render = { props => isLoggedIn
              ? <Component {...props} />
              : <Redirect
                  to={{
                    pathname: '/login',
                    state: { from: props.location },
                  }}
                />}
        />
    )
}

const AppRoutes = ({ history, isLoggedIn }) => {
    console.log("HISTORY:" + JSON.stringify(history));
    return (
        <ConnectedRouter history={history}>
            <Switch>
                <Route
                    exact
                    path={'/404'}
                    component={asyncComponent(() => import('./containers/Pages/404'))}
                />
                <Route
                    exact
                    path={'/404'}
                    component={asyncComponent(() => import('./containers/Pages/404'))}
                />
                <Route
                    exact
                    path={'/500'}
                    component={asyncComponent(() => import('./containers/Pages/500'))}
                />
                <Route
                    exact
                    path={'/login'}
                    component={asyncComponent(() => import('./containers/Pages/login'))}
                />
                <Route
                    exact
                    path={'/signup'}
                    component={asyncComponent(() => import('./containers/Pages/signup'))}
                />
                <RestrictedRoute
                    path="/"
                    component={App}
                    isLoggedIn={true}
                />
            </Switch>
        </ConnectedRouter>
    );
};

export default connect(state => ({
  isLoggedIn: state.auth.get('userToken') !== null,
}))(AppRoutes);
