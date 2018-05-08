import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import 'react-notifications/src/notifications.scss';
import {NotificationContainer, NotificationManager} from 'react-notifications';

import authAction from 'reducers/auth/actions';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

import AuthActions from 'reducers/auth/actions';

let {register, clearNotify} = AuthActions;

class Signup extends Component{
    state = {
        isLoggedIn: false,
        redirectToHome: false,
        isShowNotification: false,
        notify: this.props.notify
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.isLoggedIn !== nextProps.isLoggedIn &&
          nextProps.isLoggedIn === true) {
              return {
                  isLoggedIn: nextProps.isLoggedIn,
                  redirectToHome: true
              }
        }

        if (prevState.notify !== nextProps.notify && typeof nextProps.notify !== 'undefined') {
            return {
                notify: nextProps.notify,
                isShowNotification: true
            }
        }
        return null;
    }

    handleLogin = (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        this.props.register({
            username: data.get('username'),
            email: data.get('email'),
            password: data.get('password'),
            passwordConfirm: data.get('passwordConfirm'),
            firstname: data.get('firstname'),
            lastname: data.get('lastname'),
        });
    }
    componentDidUpdate = () => {
        if (this.state.isShowNotification) {
            this.handleNotification();
        }
    }
    handleNotification = () => {
        let notify = this.state.notify;
        if(!notify) return;

        if(notify.success){
            // TODO show success notify
        } else {
            NotificationManager.error(notify.message, 'Register Fail');
            if(notify.error && notify.error.errors){
                let erros = notify.error.errors;
                let keys = Object.keys(erros);
                keys.forEach((err) => {
                    if(erros[err]){
                        NotificationManager.error(`${err} : ${erros[err].message}`, 'Register Fail');
                    }
                })
            }

        }
        this.props.clearNotify();

        this.setState({ isShowNotification: false });
    }
    render() {
        // login
        if (this.state.redirectToHome) {
            return <Redirect to='/#' />;
        }
        return (
            <div
                className="login-container w-100 d-flex justify-content-center align-items-center animated slideInUpTiny animation-duration-3">
                <div className="login-content text-center">
                    <div className="login-header">
                        <a className="app-logo" href="#/" title="Jambo">
                            <img src="http://via.placeholder.com/220x80" alt="jambo" title="jambo" />
                        </a>
                    </div>

                    <div className="mb-4">
                        <h2>Create an account</h2>
                    </div>

                    <div className="login-form">
                        <form onSubmit={this.handleLogin}>
                            <TextField
                                type="text"
                                id="username"
                                label="Username"
                                name="username"
                                fullWidth
                                defaultValue=""
                                margin="normal"
                                className="mt-0 mb-2"
                                required
                            />
                            <TextField
                                type="email"
                                id="email"
                                name="email"
                                label="Email"
                                fullWidth
                                defaultValue=""
                                margin="normal"
                                className="mt-0 mb-2"
                                required
                            />

                            <TextField
                                type="password"
                                id="password"
                                name="password"
                                label="Password"
                                fullWidth
                                defaultValue=""
                                margin="normal"
                                className="mt-0 mb-4"
                                required
                            />
                            <TextField
                                type="password"
                                id="passwordConfirm"
                                name="passwordConfirm"
                                label="Confirm Password"
                                fullWidth
                                defaultValue=""
                                margin="normal"
                                className="mt-0 mb-4"
                                required
                            />
                            <TextField
                                id="firstname"
                                name="firstname"
                                label="First Name"
                                fullWidth
                                defaultValue=""
                                margin="normal"
                                className="mt-1"
                            />
                            <TextField
                                id="lastname"
                                name="lastname"
                                label="Last Name"
                                fullWidth
                                defaultValue=""
                                margin="normal"
                                className="mt-1"
                            />

                            <div className="mb-3">
                                <button className="jr-btn text-white btn-primary" type="submit">Regsiter</button>
                            </div>
                            <p>Have an account <a className="text-primary" href="#/login">Sign in</a></p>
                        </form>
                    </div>
                    <NotificationContainer/>
                </div>
            </div>
        );
    }
};
const mapStateToProps = state => {
    return ({
        isLoggedIn: state.auth.userToken !== null,
        notify: state.auth.notify
    });
}
export default connect(mapStateToProps, { register , clearNotify } )(Signup);
