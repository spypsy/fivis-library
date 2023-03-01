import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Layout, Menu, Image, MenuProps } from 'antd';
import { BookOutlined, ScanOutlined } from '@ant-design/icons';

import logo from './logo.png';

const { Header, Content, Footer } = Layout;

const items: MenuProps['items'] = [
  {
    label: 'My Books',
    key: 'my-books',
    icon: <BookOutlined />,
  },
  {
    label: 'Scan Books',
    key: 'home',
    icon: <ScanOutlined />,
  },
];

const NavBar = () => {
  const history = useHistory();

  const onClick: MenuProps['onClick'] = (e) => {
    history.push(`/${e.key}`);
  };
  return (
    <Header className="header">
      <div className="logo">
        <a href="/home">
          <Image src={logo} preview={false} />
        </a>
      </div>
      <Menu
        theme="light"
        className="nav-menu"
        items={items}
        onClick={onClick}
        selectedKeys={[history.location.pathname.replace('/', '')]}
        mode="horizontal"
        defaultSelectedKeys={['scanBooks']}
      />
    </Header>
  );
};

export default NavBar;
