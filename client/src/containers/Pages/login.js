import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import authAction from 'reducers/auth/actions';

const { login } = authAction;
class Login extends Component{
    state = {
        redirectToReferrer: false,
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.isLoggedIn !== nextProps.isLoggedIn &&
        nextProps.isLoggedIn === true) {
            this.setState({ redirectToReferrer: true });
        }
    }

    handleLogin = () => {
        const { login } = this.props;
        // TODO: Call Login request
        // login();
        this.props.history.push('/app');
    };

    render() {
        // login
        this.handleLogin();
        const from = { pathname: '/app' };
        const { redirectToReferrer } = this.state;

        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }

        return (
            <div
                className="login-container d-flex justify-content-center align-items-center animated slideInUpTiny animation-duration-3">
                <div className="login-content">
                    <div className="login-header">
                        <a className="app-logo" href="#/" title="Jambo">
                            <img src="http://via.placeholder.com/220x80" alt="jambo" title="jambo"/>
                        </a>
                    </div>

                    <div className="login-form">
                        <form>
                            <fieldset>
                                <div className="form-group">
                                    <input name="email" id="email" className="form-control form-control-lg"
                                        placeholder="Email" type="email"/>
                                </div>
                                <div className="form-group">
                                    <input name="password" id="password" className="form-control form-control-lg"
                                        placeholder="Password" type="password"/>
                                </div>
                                <div className="form-group d-flex justify-content-between align-items-center">
                                    <label className="custom-control custom-checkbox float-left">
                                        <input type="checkbox" className="custom-control-input"/>
                                        <span className="custom-control-indicator"/>
                                        <span className="custom-control-description">Remember me</span>
                                    </label>
                                </div>

                                <a href="#" className="btn jr-btn-rounded btn-primary btn-rounded">Sign In</a>

                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
};

export default connect(
    state => ({
      isLoggedIn: state.Auth.get('userToken') !== null ? true : false,
    }),
    { login }
  )(Login);
