import { Spin } from 'antd';
import { useActiveLibrary } from 'hooks/activeLibrary';
import { useCheckAuth } from 'hooks/unauthorizedEffect';
import { Book } from 'pages/Book';
import AuthorPage from 'pages/Author';
import Authors from 'pages/Authors';
import Home from 'pages/Home';
import Login from 'pages/Login';
import MyBooks from 'pages/MyBooks';
import Register from 'pages/Register';
import SearchPage from 'pages/Search';
import Sharing from 'pages/Sharing';
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
      <ProtectedRoute component={Authors} path="/authors" exact />
      <ProtectedRoute component={SearchPage} path="/search" exact />
      <ProtectedRoute component={Sharing} path="/sharing" exact />
      <ProtectedRoute component={AuthorPage} path="/author/:authorName" />
      <ProtectedRoute component={Book} path="/book/:isbn" />
    </Switch>
  );
};

interface ProtectedRouteProps extends RouteProps {
  // Using React.ComponentType allows you to accept both functional and class components
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  const { isAuthed, loading } = useCheckAuth();
  const { isViewingShared } = useActiveLibrary();
  const isHomeRoute = rest.path === '/home';

  return (
    <Route
      {...rest}
      render={props => {
        if (loading) {
          return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Spin size="large" />
            </div>
          );
        }
        if (!isAuthed) {
          return <Redirect to="/login" />;
        }
        if (isHomeRoute && isViewingShared) {
          return <Redirect to="/my-books" />;
        }
        return <Component {...props} />;
      }}
    />
  );
};

export default Routes;
