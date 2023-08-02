import { Book } from 'pages/Book';
import Home from 'pages/Home';
import Login from 'pages/Login';
import MyBooks from 'pages/MyBooks';
import Register from 'pages/Register';
import Welcome from 'pages/Welcome';
import React from 'react';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';

const Routes = () => {
  return (
    <Switch>
      <Route path="/" exact>
        <Welcome />
      </Route>
      <Route path="/login" exact>
        <Login />
      </Route>
      <Route path="/register" exact>
        <Register />
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

const ProtectedRoute: React.FC<RouteProps> = ({ component: Component, ...rest }) => {
  const isAuthenticated = localStorage.getItem('token'); // Adjust this to your needs

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated && Component ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" /> // Or /welcome if you prefer
        )
      }
    />
  );
};

export default Routes;
