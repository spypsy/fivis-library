import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import Welcome from 'pages/Welcome';
import Login from 'pages/Login';
import Home from 'pages/Home';

const Routes = () => {
  return (
    <Switch>
      <Route path="/" exact>
        <Welcome />
      </Route>
      <Route path="/login" exact>
        <Login />
      </Route>
      <Route path="/home" exact>
        <Home />
      </Route>
    </Switch>
  );
};

Routes.propTypes = {};

export default Routes;
