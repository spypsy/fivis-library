import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Layout, Menu, Image, MenuProps } from 'antd';
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import logo from './logo.png';

const { Header, Content, Footer } = Layout;

const items: MenuProps['items'] = [
  // {
  //   label: 'Navigation One',
  //   key: 'mail',
  //   icon: <MailOutlined />,
  // },
  // {
  //   label: 'Navigation Two',
  //   key: 'app',
  //   icon: <AppstoreOutlined />,
  //   disabled: true,
  // },
  // {
  //   label: 'Navigation Three - Submenu',
  //   key: 'SubMenu',
  //   icon: <SettingOutlined />,
  //   children: [
  //     {
  //       type: 'group',
  //       label: 'Item 1',
  //       children: [
  //         {
  //           label: 'Option 1',
  //           key: 'setting:1',
  //         },
  //         {
  //           label: 'Option 2',
  //           key: 'setting:2',
  //         },
  //       ],
  //     },
  //     {
  //       type: 'group',
  //       label: 'Item 2',
  //       children: [
  //         {
  //           label: 'Option 3',
  //           key: 'setting:3',
  //         },
  //         {
  //           label: 'Option 4',
  //           key: 'setting:4',
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   label: (
  //     <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
  //       Navigation Four - Link
  //     </a>
  //   ),
  //   key: 'alipay',
  // },
];

const NavBar = () => {
  const [current, setCurrent] = useState('mail');

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
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
        selectedKeys={[current]}
        mode="horizontal"
        defaultSelectedKeys={['1']}
      />
    </Header>
  );
};

export default NavBar;
