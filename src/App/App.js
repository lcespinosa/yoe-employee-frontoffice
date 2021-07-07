import React, {Component} from "react";
import "./App.css";
import { Router, Redirect } from "react-router-dom";
import { connect } from 'react-redux';
import {Route, Switch} from "react-router";

import Login from '../_containers/Pages/Login/Login';
import Home from '../_containers/Pages/Home/Home';
import {PrivateRoute} from "../_components";
import { history } from '../_helpers';
import { alertActions, userActions } from '../_actions';

class App extends Component {

  constructor(props) {
    super(props);

    const { dispatch } = this.props;
    history.listen((location, action) => {
      // clear alert on location change
      dispatch(alertActions.clear());

      if (location === '/logout') {
        dispatch(userActions.logout());
      }
    });
  }

  render() {
    return (
      <Router history={history}>
        <Switch>
          <PrivateRoute path='/' exact component={Home}/>
          <Route path='/login' component={Login}/>
          <Redirect to='/' />
        </Switch>
      </Router>
    );
  }
}

const mapStateToProps = state => {
  const { alert } = state;
  return {
    alert
  };
}

export default connect(mapStateToProps)(App);
