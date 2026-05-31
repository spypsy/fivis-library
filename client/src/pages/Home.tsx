import { Button, Card, Collapse, Form, Skeleton, Space, message } from 'antd';
import { AxiosError } from 'axios';
import useAxios from 'axios-hooks';
import ManualBookForm from 'components/ManualBookForm';
import PageShell from 'components/PageShell';
import ScanModal from 'components/ScanModal';
import { useTags } from 'hooks/useTags';
import startCase from 'lodash.startcase';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, User, UserBook } from 'types';

import { ScanOutlined } from '@ant-design/icons';

const Home = () => {
  const [{ data: userData, loading, error: userError }] = useAxios('/api/user/info', { manual: false });
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(state => !state);
  const [form] = Form.useForm();
  const [{ loading: addingBook }, executeAddBook] = useAxios({ url: '/api/books', method: 'POST' }, { manual: true });
  const { tags: tagsData, loading: tagsLoading } = useTags();

  const onFinish = async (values: Partial<UserBook>) => {
    try {
      if (values.publishedDate) {
        values.publishedDate = new Date(values.publishedDate).toString();
      }
      if (values.tags) {
        values.tags = values.tags.map(tag => ({ name: tag as any as string }));
      }
      if (values.originalPublishedYear) {
        values.originalPublishedYear = new Date(values.originalPublishedYear).getFullYear();
      }
      await executeAddBook({ data: { bookData: { ...values }, manual: true } });
      form.resetFields();
      message.success(
        <>
          Book added.{' '}
          <Link to={`/book/${values.isbn}`}>View book</Link>
        </>,
      );
    } catch (error) {
      console.error('Failed to add book:', error);
      message.error(`${(error as AxiosError).response?.data || (error as Error).message || 'Unknown error'}`);
    }
  };

  const tags: Tag[] = tagsData || [];

  if (loading || tagsLoading) {
    return (
      <PageShell>
        <Skeleton active paragraph={{ rows: 4 }} />
      </PageShell>
    );
  }

  if (userError || !userData?.user) {
    return (
      <PageShell>
        <Skeleton active paragraph={{ rows: 4 }} />
      </PageShell>
    );
  }

  const user = userData.user as User;
  const displayName = startCase(user?.username || '');

  return (
    <PageShell title={`Hi, ${displayName}`} subtitle="Add books to your library">
      <Card className="home-scan-card">
        <Space direction="vertical" size="middle">
          <div>
            <strong>Scan barcode</strong>
            <p style={{ margin: '8px 0 0', color: '#666' }}>
              Use your barcode scanner (it sends Enter after each ISBN). You can also type an ISBN in the scan window.
            </p>
          </div>
          <Button type="primary" size="large" icon={<ScanOutlined />} onClick={toggleModal}>
            Open scanner
          </Button>
        </Space>
      </Card>

      <Collapse
        items={[
          {
            key: 'manual',
            label: 'Add manually',
            children: (
              <ManualBookForm onFinish={onFinish} addingBook={addingBook} tags={tags} formRef={form} />
            ),
          },
        ]}
      />

      {showModal && <ScanModal isOpen={showModal} toggleModal={toggleModal} />}
    </PageShell>
  );
};

export default Home;
