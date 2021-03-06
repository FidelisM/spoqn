/*global describe, it, beforeEach, expect*/

import React from 'react';
import ReactDOM from 'react-dom';
import MockRouter from 'react-mock-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import configureStore from 'redux-mock-store'

import initialState from 'InitialState';
import Login from 'Login';

describe('Login', () => {
    const mockStore = configureStore();

    let store, container;

    beforeEach(() => {
        store = mockStore(initialState);
        container = document.createElement('div');
    });

    it('renders without crashing', () => {
        ReactDOM.render(<MuiThemeProvider><MockRouter><Login store={store}/></MockRouter></MuiThemeProvider>, container);
    });
});