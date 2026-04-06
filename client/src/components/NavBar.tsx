import { BookOutlined, MenuOutlined, ScanOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Drawer, Image, Layout, Menu, MenuProps, message } from 'antd';
import useAxios from 'axios-hooks';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { User } from 'types';
import { useLocalStorage } from 'usehooks-ts';

import logo from './logo.png';

const { Header } = Layout;

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
  {
    label: 'Search',
    key: 'search',
    icon: <SearchOutlined />,
  },
];

const NavBar = () => {
  const history = useHistory();
  const [, setUser] = useLocalStorage<User | null>('user', {});
  const [isAuthed, setAuthed] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const user = localStorage.getItem('user');
  if (!!JSON.parse(user || '{}')?.id && !isAuthed) {
    setAuthed(!!JSON.parse(user || '{}')?.id);
  }

  useEffect(() => {
    const unlisten = history.listen(() => {
      const user = localStorage.getItem('user');
      const isAuthed = !!JSON.parse(user || '{}')?.id;
      setAuthed(isAuthed);
      setDrawerVisible(false);
    });

    return () => {
      unlisten();
    };
  }, [history, setAuthed]);

  const [, logOut] = useAxios(
    {
      url: '/api/user/logout',
      method: 'POST',
    },
    { manual: true },
  );

  const onClick: MenuProps['onClick'] = e => {
    history.push(`/${e.key}`);
    setDrawerVisible(false);
  };
  const onLogout = () => {
    setUser(null);
    setDrawerVisible(false);
    logOut().then(() => {
      history.push('/login');
      message.success('Logged out');
    });
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
        className="nav-menu desktop-menu"
        items={items}
        onClick={onClick}
        selectedKeys={[history.location.pathname.replace('/', '')]}
        mode="horizontal"
        defaultSelectedKeys={['scanBooks']}
      />
      {isAuthed && (
        <div className="sign-out-wrapper desktop-menu">
          <Button onClick={onLogout}>Sign out</Button>
        </div>
      )}
      <Button
        className="mobile-menu-button"
        type="text"
        icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
        onClick={() => setDrawerVisible(true)}
      />
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        bodyStyle={{ padding: 0 }}
        width={250}
      >
        <Menu
          items={items}
          onClick={onClick}
          selectedKeys={[history.location.pathname.replace('/', '')]}
          mode="vertical"
        />
        {isAuthed && (
          <div style={{ padding: '16px 24px' }}>
            <Button onClick={onLogout} block>
              Sign out
            </Button>
          </div>
        )}
      </Drawer>
    </Header>
  );
};

export default NavBar;
