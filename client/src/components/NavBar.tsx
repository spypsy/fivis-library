import {
  BookOutlined,
  DownOutlined,
  MenuOutlined,
  ScanOutlined,
  SearchOutlined,
  ShareAltOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Dropdown, Image, Layout, Menu, MenuProps, Space, Tag, message } from 'antd';
import useAxios from 'axios-hooks';
import { clearActiveLibrary, useActiveLibrary } from 'hooks/activeLibrary';
import { clearStaleSession, readIsAuthedFromStorage } from 'hooks/authSession';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { User } from 'types';
import { useLocalStorage } from 'usehooks-ts';

import logo from './logo.png';

const { Header } = Layout;

type ShareUser = { id: string; username: string };
type SharesResponse = {
  sharedByMe: ShareUser[];
  sharedWithMe: ShareUser[];
};

function navSelectedKey(pathname: string): string[] {
  const segment = pathname.replace(/^\//, '').split('/')[0];
  if (segment === 'home' || segment === 'my-books' || segment === 'search' || segment === 'authors') {
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
  const { activeLibrary, setActiveLibrary, isViewingShared } = useActiveLibrary();

  const [{ data: sharesData }, refetchShares] = useAxios<SharesResponse>(
    { url: '/api/shares' },
    { manual: true, useCache: false },
  );

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
          clearActiveLibrary();
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

  useEffect(() => {
    if (isAuthed) {
      refetchShares();
    }
  }, [isAuthed, refetchShares, location.pathname]);

  const [, logOut] = useAxios(
    {
      url: '/api/user/logout',
      method: 'POST',
    },
    { manual: true },
  );

  const appMenuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [];
    if (!isViewingShared) {
      items.push({
        label: 'Scan',
        key: 'home',
        icon: <ScanOutlined />,
      });
    }
    items.push(
      {
        label: 'My Books',
        key: 'my-books',
        icon: <BookOutlined />,
      },
      {
        label: 'Authors',
        key: 'authors',
        icon: <TeamOutlined />,
      },
      {
        label: 'Search',
        key: 'search',
        icon: <SearchOutlined />,
      },
    );
    return items;
  }, [isViewingShared]);

  const onClick: MenuProps['onClick'] = e => {
    history.push(`/${e.key}`);
    setDrawerOpen(false);
  };

  const onLogout = () => {
    setUser(null);
    clearActiveLibrary();
    setDrawerOpen(false);
    logOut().then(() => {
      history.push('/login');
      message.success('Logged out');
      setAuthed(false);
    });
  };

  const switchToMyLibrary = () => {
    setActiveLibrary(undefined);
    history.push('/my-books');
    setDrawerOpen(false);
  };

  const switchToSharedLibrary = (owner: ShareUser) => {
    setActiveLibrary({ ownerId: owner.id, ownerName: owner.username });
    history.push('/my-books');
    setDrawerOpen(false);
  };

  const sharedWithMe = sharesData?.sharedWithMe || [];

  const libraryMenuItems: MenuProps['items'] = [
    {
      key: 'mine',
      label: 'My library',
      onClick: switchToMyLibrary,
    },
    ...(sharedWithMe.length
      ? [
          { type: 'divider' as const },
          ...sharedWithMe.map(owner => ({
            key: owner.id,
            label: `${owner.username}'s library`,
            onClick: () => switchToSharedLibrary(owner),
          })),
        ]
      : []),
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'sharing',
      icon: <ShareAltOutlined />,
      label: 'Sharing',
      onClick: () => {
        history.push('/sharing');
        setDrawerOpen(false);
      },
    },
    {
      key: 'logout',
      label: 'Sign out',
      onClick: onLogout,
    },
  ];

  const logoTarget = isAuthed ? (isViewingShared ? '/my-books' : '/home') : '/';
  const libraryLabel = isViewingShared ? `${activeLibrary!.ownerName}'s library` : 'My library';

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
          <div className="nav-actions desktop-menu">
            {isViewingShared && (
              <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                Viewing {activeLibrary!.ownerName}&apos;s library
              </Tag>
            )}
            <Dropdown menu={{ items: libraryMenuItems }} trigger={['click']}>
              <Button type="default">
                <Space size={4}>
                  Libraries
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <Button type="default" icon={<UserOutlined />}>
                Account
              </Button>
            </Dropdown>
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
            {isViewingShared && (
              <div style={{ padding: '12px 24px' }}>
                <Tag color="blue">Viewing {activeLibrary!.ownerName}&apos;s library</Tag>
              </div>
            )}
            <Menu
              items={appMenuItems}
              onClick={onClick}
              selectedKeys={navSelectedKey(location.pathname)}
              mode="vertical"
            />
            <Menu
              mode="vertical"
              selectable={false}
              items={[
                {
                  key: 'libraries',
                  label: `Libraries (${libraryLabel})`,
                  children: libraryMenuItems,
                },
                {
                  key: 'sharing',
                  icon: <ShareAltOutlined />,
                  label: 'Sharing',
                  onClick: () => {
                    history.push('/sharing');
                    setDrawerOpen(false);
                  },
                },
              ]}
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
