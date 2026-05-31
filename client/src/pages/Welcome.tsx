import { BookOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import PageShell from 'components/PageShell';
import React from 'react';
import { useHistory } from 'react-router-dom';

const Welcome = () => {
  const history = useHistory();

  return (
    <PageShell>
      <div className="welcome-hero">
        <BookOutlined style={{ fontSize: 72, color: '#25430D', marginBottom: 24 }} />
        <Typography.Title level={2}>Welcome to Fivi&apos;s Library</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 420, margin: '0 auto 32px' }}>
          Catalog your books by barcode scan or manual entry.
        </Typography.Paragraph>
        <Space size="middle">
          <Button type="primary" size="large" onClick={() => history.push('/register')}>
            Sign up
          </Button>
          <Button size="large" onClick={() => history.push('/login')}>
            Log in
          </Button>
        </Space>
      </div>
    </PageShell>
  );
};

export default Welcome;
