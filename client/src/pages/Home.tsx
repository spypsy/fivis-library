import { Button, Col, Collapse, Form, Row, Spin, message } from 'antd';
import { AxiosError } from 'axios';
import useAxios from 'axios-hooks';
import ManualBookForm from 'components/ManualBookForm';
import ScanModal from 'components/ScanModal';
import { useTags } from 'hooks/useTags';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, User, UserBook } from 'types';

const { Panel } = Collapse;

const Home = () => {
  const [{ data: userData, loading }] = useAxios('/api/user/info', { manual: false });
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(state => !state);
  const [form] = Form.useForm();
  const [{ loading: addingBook }, executeAddBook] = useAxios({ url: '/api/books', method: 'POST' }, { manual: true });
  const { tags: tagsData, loading: tagsLoading } = useTags();

  const onFinish = async (values: Partial<UserBook>) => {
    try {
      // If you need to convert the year string to a Date object
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
          <p>Book added successfully</p>
          <p>
            Go <Link to={`/book/${values.isbn}`}>here</Link> to see it
          </p>
        </>,
      );
      // Optionally, show a success message or update the book list
    } catch (error) {
      console.error('Failed to add book:', error);
      message.error(`${(error as AxiosError).response?.data || (error as Error).message || 'Unknown error'}`);
    }
  };

  const tags: Tag[] = tagsData || [];

  if (loading || tagsLoading) {
    return <Spin />;
  }
  const user = userData.user as User;
  return (
    <>
      <Row>
        <Col span={8}>
          <h1>
            Hi,{' '}
            {user?.username
              ?.split('')
              ?.map((char, i) => (i === 0 ? char.toUpperCase() : char))
              ?.join('')}
            !
          </h1>
          <h1>Ready to scan some books?</h1>
          <Button type="primary" onClick={toggleModal}>
            Click here!
          </Button>
        </Col>
        <Col span={8} />
      </Row>
      <Row style={{ marginTop: 40 }}>
        <Col span={24}>
          <h2>Or, Manually Add a Book</h2>
          <Collapse>
            <Panel header="Manually Add a Book" key="1">
              <ManualBookForm onFinish={onFinish} addingBook={addingBook} tags={tags} formRef={form} />
            </Panel>
          </Collapse>
        </Col>
        {showModal && <ScanModal isOpen={showModal} toggleModal={toggleModal} />}
      </Row>
    </>
  );
};

Home.propTypes = {};

export default Home;
