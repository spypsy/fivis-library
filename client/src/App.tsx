import { Layout } from 'antd';
import NavBar from 'components/NavBar';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from 'routes';

import './App.less';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout className="layout">
        <NavBar />
        <Content>
          <Routes />
        </Content>
      </Layout>
    </Router>
  );
};

export default App;
