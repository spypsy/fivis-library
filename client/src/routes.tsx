import { useCheckAuth } from 'hooks/unauthorizedEffect';
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
      <ProtectedRoute component={Home} path="/home" exact />
      <ProtectedRoute component={MyBooks} path="/my-books" exact />
      <ProtectedRoute component={Book} path="/book/:isbn" />
    </Switch>
  );
};

interface ProtectedRouteProps extends RouteProps {
  // Using React.ComponentType allows you to accept both functional and class components
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  // const isAuthenticated = checkIfUserIsAuthenticated();
  const { isAuthed } = useCheckAuth();

  return <Route {...rest} render={props => (isAuthed ? <Component {...props} /> : <Redirect to="/login" />)} />;
};

export default Routes;
