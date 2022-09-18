import { Button, Col, Layout, Menu, Row } from 'antd';
import React from 'react';

import NavBar from 'components/NavBar';
import { Login } from 'components/Login';

import './App.less';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => (
  <Layout className="layout">
    <NavBar />
    <Content>
      <Row>
        <Col span={12}>
          <Login />
        </Col>
      </Row>
    </Content>
  </Layout>
);

export default App;
