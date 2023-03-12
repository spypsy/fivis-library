import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Welcome from 'pages/Welcome';
import Login from 'pages/Login';
import Home from 'pages/Home';
import MyBooks from 'pages/MyBooks';
import { Book } from 'pages/Book';

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
      <Route path="/my-books" exact>
        <MyBooks />
      </Route>
      <Route path="/book/:isbn">
        <Book />
      </Route>
    </Switch>
  );
};

export default Routes;
