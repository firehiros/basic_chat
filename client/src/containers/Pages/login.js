import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import authAction from 'reducers/auth/actions';
import 'react-notifications/src/notifications.scss';
import {NotificationContainer, NotificationManager} from 'react-notifications';

import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import {FormControlLabel} from 'material-ui/Form';

class Login extends Component{
    state = {
        isLoggedIn: false,
        redirectToHome: false,
        isShowNotification: false,
        error: this.props.error
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.isLoggedIn !== nextProps.isLoggedIn &&
          nextProps.isLoggedIn === true) {
              return {
                  redirectToHome: true
              }
        }

        if (prevState.error !== nextProps.error && typeof nextProps.error !== 'undefined') {
            return {
                error: nextProps.error,
                isShowNotification: true
            }
        }
        return null;
    }

    handleLogin = (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        const { login } = this.props;
        this.props.login({
            indentifier: data.get('indentifier'),
            password: data.get('password')
        });
    }
    componentDidUpdate = () => {
        if (this.state.isShowNotification) {
            this.handleNotification();
        }
    }
    handleNotification = () => {
        let error = this.state.error;

        NotificationManager.error(error.message, 'Login Fail');

        this.setState({ isShowNotification: false });
    }
    render() {
        // login
        if (this.state.redirectToHome) {
            return <Redirect to='/#' />;
        }

        return (
            <div className="login-container w-100 d-flex justify-content-center align-items-center animated slideInUpTiny animation-duration-3">
                <div className="login-content">
                    <div className="login-header mb-4">
                        <a className="app-logo" href="#/" title="Basic Chat">
                            <img src="http://via.placeholder.com/220x80" alt="jambo" title="jambo"/>
                        </a>
                    </div>

                    <div className="login-form">
                        <form onSubmit={this.handleLogin}>
                            <fieldset>
                                <TextField
                                    id="indentifier"
                                    name="indentifier"
                                    label="Username/Email"
                                    defaultValue=""
                                    margin="normal"
                                    className="mt-1"
                                    fullWidth
                                    required
                                />
                                <TextField
                                    type="password"
                                    id="password"
                                    name="password"
                                    label="Password"
                                    defaultValue=""
                                    margin="normal"
                                    className="mt-1"
                                    fullWidth
                                    required
                                />
                                <div className="mt-1 mb-2 d-flex justify-content-between align-items-center">
                                    <FormControlLabel
                                        control={
                                            <Checkbox value="gilad" />
                                        }
                                        label="Remember me"
                                    />
                                </div>
                                <button className="jr-btn btn-primary" type="submit">Sign In</button>
                                <p>Don&#39;t have a account <a className="text-primary" href="#/signup">Register now</a></p>
                            </fieldset>
                        </form>
                    </div>
                    <NotificationContainer/>
                </div>
            </div>
        )
    }
};
const mapStateToProps = state => ({
    isLoggedIn: state.auth.userToken !== null,
    error: state.auth.error
});
export default connect(mapStateToProps, { login: authAction.login } )(Login);
