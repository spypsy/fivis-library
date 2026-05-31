import { BookOutlined, MenuOutlined, ScanOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Drawer, Image, Layout, Menu, MenuProps, message } from 'antd';
import useAxios from 'axios-hooks';
import { clearStaleSession, readIsAuthedFromStorage } from 'hooks/authSession';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { User } from 'types';
import { useLocalStorage } from 'usehooks-ts';

import logo from './logo.png';

const { Header } = Layout;

const appMenuItems: MenuProps['items'] = [
  {
    label: 'My Books',
    key: 'my-books',
    icon: <BookOutlined />,
  },
  {
    label: 'Scan',
    key: 'home',
    icon: <ScanOutlined />,
  },
  {
    label: 'Search',
    key: 'search',
    icon: <SearchOutlined />,
  },
];

function navSelectedKey(pathname: string): string[] {
  const segment = pathname.replace(/^\//, '').split('/')[0];
  if (segment === 'home' || segment === 'my-books' || segment === 'search') {
    return [segment];
  }
  return [];
}

const NavBar = () => {
  const history = useHistory();
  const location = useLocation();
  const [, setUser] = useLocalStorage<User | null>('user', null);
  const [isAuthed, setAuthed] = useState(readIsAuthedFromStorage);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const syncAuth = useCallback(() => {
    setAuthed(readIsAuthedFromStorage());
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    syncAuth();
    const unlisten = history.listen(syncAuth);
    const onAuthChanged = () => syncAuth();
    window.addEventListener('fivis-auth-changed', onAuthChanged);
    return () => {
      unlisten();
      window.removeEventListener('fivis-auth-changed', onAuthChanged);
    };
  }, [history, syncAuth]);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      if (!readIsAuthedFromStorage()) {
        setAuthed(false);
        return;
      }
      try {
        const res = await fetch('/api/check-auth', { credentials: 'include' });
        if (cancelled) {
          return;
        }
        if (!res.ok) {
          clearStaleSession();
          setAuthed(false);
        } else {
          setAuthed(true);
        }
      } catch {
        if (!cancelled) {
          setAuthed(readIsAuthedFromStorage());
        }
      }
    };

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const [, logOut] = useAxios(
    {
      url: '/api/user/logout',
      method: 'POST',
    },
    { manual: true },
  );

  const onClick: MenuProps['onClick'] = e => {
    history.push(`/${e.key}`);
    setDrawerOpen(false);
  };

  const onLogout = () => {
    setUser(null);
    setDrawerOpen(false);
    logOut().then(() => {
      history.push('/login');
      message.success('Logged out');
      setAuthed(false);
    });
  };

  const logoTarget = isAuthed ? '/home' : '/';

  return (
    <Header className="header">
      <div className="logo">
        <Link to={logoTarget}>
          <Image src={logo} preview={false} alt="Fivi's Library" />
        </Link>
      </div>
      {isAuthed ? (
        <>
          <Menu
            theme="dark"
            className="nav-menu desktop-menu"
            items={appMenuItems}
            onClick={onClick}
            selectedKeys={navSelectedKey(location.pathname)}
            mode="horizontal"
          />
          <div className="sign-out-wrapper desktop-menu">
            <Button type="default" onClick={onLogout}>
              Sign out
            </Button>
          </div>
          <Button
            className="mobile-menu-button"
            type="text"
            icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
          />
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            styles={{ body: { padding: 0 } }}
            width={250}
          >
            <Menu
              items={appMenuItems}
              onClick={onClick}
              selectedKeys={navSelectedKey(location.pathname)}
              mode="vertical"
            />
            <div style={{ padding: '16px 24px' }}>
              <Button onClick={onLogout} block>
                Sign out
              </Button>
            </div>
          </Drawer>
        </>
      ) : (
        <>
          <div className="auth-links desktop-menu">
            <Link to="/login">
              <Button type="text" style={{ color: '#fff' }}>
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button type="default">Sign up</Button>
            </Link>
          </div>
          <Button
            className="mobile-menu-button"
            type="text"
            icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
          />
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={250}
          >
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/login" onClick={() => setDrawerOpen(false)}>
                <Button block>Log in</Button>
              </Link>
              <Link to="/register" onClick={() => setDrawerOpen(false)}>
                <Button type="primary" block>
                  Sign up
                </Button>
              </Link>
            </div>
          </Drawer>
        </>
      )}
    </Header>
  );
};

export default NavBar;
