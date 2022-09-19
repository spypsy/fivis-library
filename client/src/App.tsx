import { Button, Col, Layout, Menu, Row } from 'antd';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Routes from 'routes';
import NavBar from 'components/NavBar';

import './App.less';

const { Content } = Layout;

const App: React.FC = () => (
  <Router>
    <Layout className="layout">
      <NavBar />
      <Content>
        <Routes />
      </Content>
    </Layout>
  </Router>
);

export default App;
