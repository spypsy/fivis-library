import { BookOutlined, ScanOutlined } from '@ant-design/icons';
import { Button, Image, Layout, Menu, MenuProps, message } from 'antd';
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
];

const NavBar = () => {
  const history = useHistory();
  const [, setUser] = useLocalStorage<User | null>('user', {});
  const [isAuthed, setAuthed] = useState<boolean>(false);
  const user = localStorage.getItem('user');
  if (!!JSON.parse(user || '{}')?.id && !isAuthed) {
    setAuthed(!!JSON.parse(user || '{}')?.id);
  }

  useEffect(() => {
    const unlisten = history.listen(() => {
      const user = localStorage.getItem('user');
      const isAuthed = !!JSON.parse(user || '{}')?.id;
      setAuthed(isAuthed);
    });

    // Cleanup the listener when the component is unmounted
    return () => {
      unlisten();
    };
  }, [history, setAuthed]);

  // HANDLERS
  const [, logOut] = useAxios(
    {
      url: '/api/user/logout',
      method: 'POST',
    },
    { manual: true },
  );

  const onClick: MenuProps['onClick'] = e => {
    history.push(`/${e.key}`);
  };
  const onLogout = () => {
    setUser(null);
    logOut().then(() => {
      history.push('/login');
      message.success('Logged out');
    });
  };
  return (
    <Header className="header">
      <div className="logo">
        <a href="/">
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
      {isAuthed && (
        <div className="sign-out-wrapper">
          <Button onClick={onLogout}>Sign out</Button>
        </div>
      )}
    </Header>
  );
};

export default NavBar;
