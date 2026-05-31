import { Layout } from 'antd';
import { DocumentTitle } from 'components/DocumentTitle';
import NavBar from 'components/NavBar';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from 'routes';
import { AppTheme } from 'theme/AppTheme';

import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <AppTheme>
      <Router>
        <DocumentTitle />
        <Layout className="layout">
          <NavBar />
          <Content>
            <Routes />
          </Content>
        </Layout>
      </Router>
    </AppTheme>
  );
};

export default App;
