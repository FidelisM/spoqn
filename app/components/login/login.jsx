import React from 'react';
import services from 'Services';
import serviceManager from 'ServiceManager';

import PropTypes from 'prop-types';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Notification from 'Components/notification/notification';

import kute from 'kute.js'
import Fingerprint2 from 'fingerprintjs2'
import './login.css'
import ReactDOM from "react-dom";

class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            usernameErrorText: '',
            emailErrorText: '',
            passwordErrorText: '',
            passwordConfirmErrorText: ''
        }
    }

    toggleLoginRegister(evt) {
        let button = evt.currentTarget,
            activeView = document.querySelector('.form.active'),
            hiddenView = document.querySelector('.form:not(.active)'),
            activeViewTween = kute.fromTo('.form.active', {opacity: 1}, {opacity: 0}),
            hiddenViewTween = kute.fromTo('.form:not(.active)', {opacity: 0}, {opacity: 1});

        if (activeView.classList.contains('login-form')) {
            button.querySelector('.info-tip').innerHTML = 'Login';
        } else {
            button.querySelector('.info-tip').innerHTML = 'Register';
        }
        activeViewTween.start();
        hiddenViewTween.start();

        activeView.classList.remove('active');
        hiddenView.classList.add('active');

        this.props.dispatch({
            type: 'RESET_LOGIN_STATE'
        });

        this.setState({
            usernameErrorText: '',
            emailErrorText: '',
            passwordErrorText: '',
            passwordConfirmErrorText: ''
        });
    }

    handleRegisterButtonClick() {
        let self = this,
            state = this.context.store.getState().authReducer,
            options = {
                headers: {},
                data: {
                    username: state.username,
                    password: state.password,
                    passwordConfirm: state.passwordConfirm,
                    email: state.email,
                    telephone: state.telephone
                },
                url: services.register.url
            };

        if (this._inputIsValid(options.data)) {
            //memory leak?
            new Fingerprint2().get(function (result) {
                options.headers.browser = result;

                serviceManager.post(options).then(function (response) {
                    (response.success) ? self._handleAuthSuccess(response) : self._handleAuthFailure(response);
                }).catch(self._handleAuthFailure.bind(self));
            });
        }
    }

    handleLoginButtonClick() {
        let self = this,
            state = this.context.store.getState().authReducer,
            options = {
                headers: {},
                data: {
                    username: state.username,
                    password: state.password
                },
                url: services.login.url
            };

        //memory leak?
        new Fingerprint2().get(function (result) {
            options.headers.browser = result;

            serviceManager.post(options).then(function (response) {
                (response.success) ? self._handleAuthSuccess(response) : self._handleAuthFailure(response);
            }).catch(self._handleAuthFailure.bind(self));
        });
    }

    _inputIsValid(form) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (form.passwordConfirm !== form.password) {
            this.setState({
                passwordErrorText: 'Passwords do not match.',
                passwordConfirmErrorText: 'Passwords do not match.'
            })
        }

        if (!form.password) {
            this.setState({
                passwordErrorText: 'A password is required.',
                passwordConfirmErrorText: ''
            })
        }

        if (!form.username) {
            this.setState({
                usernameErrorText: 'A username is required.',
            })
        }

        if (!re.test(form.email.toLowerCase())) {
            this.setState({
                emailErrorText: 'Please enter a valid email address'
            })
        }

        return re.test(form.email.toLowerCase()) && (form.passwordConfirm === form.password) && form.username;
    }

    handleInputChange(evt) {
        let inputField = evt.currentTarget,
            strAction = inputField.getAttribute('data-action'),
            strKey = inputField.getAttribute('data-field'),
            stateObj = {type: 'SET_' + strAction},
            localStateKey = strKey + 'ErrorText',
            localStateObj = {};

        stateObj[strKey] = inputField.value;
        localStateObj[localStateKey] = '';

        if (this.state.hasOwnProperty(localStateKey)) {
            this.setState(localStateObj);
        }

        this.props.dispatch(stateObj);
    }

    _handleAuthSuccess(response) {
        let self = this,
            container = document.getElementById('snackbar');

        if (response.msg) {
            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(<Notification open={true} message={response.msg}/>, container);
        }

        localStorage.setItem('token', response.token);

        self.props.dispatch({
            type: 'SET_AUTH',
            auth: response.token
        });

        self.props.dispatch({
            type: 'SET_LOGGED_IN_USER',
            username: response.user.username,
            email: response.user.email,
            telephone: response.user.telephone
        });

        self.context.store.dispatch(push('/home'));
    }

    _handleAuthFailure(response) {
        let container = document.getElementById('snackbar');

        if (response && response.msg) {
            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(<Notification open={true} message={response.msg}/>, container);
        }
    }

    render() {
        return (
            <div className="login-component">
                <div className="module form-module">
                    <div className="toggle" onClick={this.toggleLoginRegister.bind(this)}>
                        <div className="info-tip">Register</div>
                    </div>
                    <div className="form active login-form">
                        <h2>Login to your account</h2>
                        <div className="login-info">
                            <TextField type="text" floatingLabelText="Username" className="login-username"
                                       data-action="USERNAME"
                                       data-field="username" onChange={this.handleInputChange.bind(this)}/>
                            <TextField type="password" floatingLabelText="Password" className="login-password"
                                       data-field="password" data-action="PASSWORD"
                                       onChange={this.handleInputChange.bind(this)}/>
                            <FlatButton onClick={this.handleLoginButtonClick.bind(this)} label={"Login"}/>
                        </div>
                    </div>
                    <div className="form register-form">
                        <h2>Create an account</h2>
                        <div className="register-info">
                            <TextField type="text" floatingLabelText="Username" className="register-username"
                                       data-action="USERNAME" data-field="username"
                                       onChange={this.handleInputChange.bind(this)}
                                       errorText={this.state.usernameErrorText}/>
                            <TextField type="password" floatingLabelText="Password" className="register-password"
                                       data-action="PASSWORD" data-field="password"
                                       onChange={this.handleInputChange.bind(this)}
                                       errorText={this.state.passwordErrorText}/>
                            <TextField type="password" floatingLabelText="Confirm Password"
                                       className="conf-register-password"
                                       data-action="CONF_PASSWORD" data-field="passwordConfirm"
                                       onChange={this.handleInputChange.bind(this)}
                                       errorText={this.state.passwordConfirmErrorText}/>
                            <TextField type="email" floatingLabelText="Email Address" className="register-email"
                                       data-action="EMAIL" data-field="email"
                                       onChange={this.handleInputChange.bind(this)}
                                       errorText={this.state.emailErrorText}/>
                            <TextField type="tel" floatingLabelText="Phone Number" className="register-telephone"
                                       data-action="TEL"
                                       data-field="telephone" onChange={this.handleInputChange.bind(this)}/>
                            <FlatButton onClick={this.handleRegisterButtonClick.bind(this)} label={"Register"}/>
                        </div>
                    </div>
                    <div className="cta"><a href="#">Forgot your password?</a></div>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    email: PropTypes.string,
    password: PropTypes.string,
    passwordConfirm: PropTypes.string,
    username: PropTypes.string,
    telephone: PropTypes.string,
    auth: PropTypes.string
};

Login.contextTypes = {
    store: PropTypes.object
};

function mapStateToProps(state) {
    return {
        username: state.authReducer.username,
        email: state.authReducer.email,
        password: state.authReducer.password,
        passwordConfirm: state.authReducer.passwordConfirm,
        telephone: state.authReducer.telephone,
        auth: state.authReducer.auth
    };
}

export default withRouter(connect(mapStateToProps)(Login));
