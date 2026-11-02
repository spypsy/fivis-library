import { Button, Empty, Form, Input, List, Popconfirm, Space, Typography, message } from 'antd';
import axios from 'axios';
import useAxios from 'axios-hooks';
import PageShell from 'components/PageShell';
import { useActiveLibrary } from 'hooks/activeLibrary';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

type ShareUser = { id: string; username: string };
type SharesResponse = {
  sharedByMe: ShareUser[];
  sharedWithMe: ShareUser[];
};

const Sharing = () => {
  const history = useHistory();
  const { setActiveLibrary } = useActiveLibrary();
  const [username, setUsername] = useState('');
  const [sharing, setSharing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | undefined>();

  const [{ data, loading }, refetch] = useAxios<SharesResponse>('/api/shares', { useCache: false });

  const onShare = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      message.error('Enter a username');
      return;
    }
    setSharing(true);
    try {
      await axios.post('/api/shares', { username: trimmed });
      message.success(`Shared your library with ${trimmed}`);
      setUsername('');
      await refetch();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data === 'string'
          ? err.response.data
          : 'Failed to share library';
      message.error(msg);
    } finally {
      setSharing(false);
    }
  };

  const onRevoke = async (userId: string, name: string) => {
    setRevokingId(userId);
    try {
      await axios.delete(`/api/shares/${userId}`);
      message.success(`Stopped sharing with ${name}`);
      await refetch();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data === 'string'
          ? err.response.data
          : 'Failed to revoke share';
      message.error(msg);
    } finally {
      setRevokingId(undefined);
    }
  };

  const browseLibrary = (owner: ShareUser) => {
    setActiveLibrary({ ownerId: owner.id, ownerName: owner.username });
    history.push('/my-books');
  };

  return (
    <PageShell
      title="Sharing"
      subtitle="Invite others to view your library, or browse libraries shared with you."
      narrow
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <section>
          <Typography.Title level={4}>I&apos;m sharing with</Typography.Title>
          <Form layout="inline" onFinish={onShare} style={{ marginBottom: 16 }}>
            <Form.Item style={{ marginBottom: 8, flex: 1 }}>
              <Input
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                allowClear
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 8 }}>
              <Button type="primary" htmlType="submit" loading={sharing}>
                Share
              </Button>
            </Form.Item>
          </Form>
          <List
            loading={loading}
            locale={{ emptyText: <Empty description="Not sharing with anyone yet" /> }}
            dataSource={data?.sharedByMe || []}
            renderItem={item => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="revoke"
                    title={`Stop sharing with ${item.username}?`}
                    onConfirm={() => onRevoke(item.id, item.username)}
                    okText="Revoke"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger type="link" loading={revokingId === item.id}>
                      Revoke
                    </Button>
                  </Popconfirm>,
                ]}
              >
                {item.username}
              </List.Item>
            )}
          />
        </section>

        <section>
          <Typography.Title level={4}>Shared with me</Typography.Title>
          <List
            loading={loading}
            locale={{ emptyText: <Empty description="No one has shared a library with you yet" /> }}
            dataSource={data?.sharedWithMe || []}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button key="browse" type="link" onClick={() => browseLibrary(item)}>
                    Browse
                  </Button>,
                ]}
              >
                {item.username}&apos;s library
              </List.Item>
            )}
          />
        </section>
      </Space>
    </PageShell>
  );
};

export default Sharing;
