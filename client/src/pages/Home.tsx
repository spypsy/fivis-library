import { Button, Col, Row, Spin } from 'antd';
import useAxios from 'axios-hooks';
import ScanModal from 'components/ScanModal';
import React, { useState } from 'react';
import { User } from 'types';

const Home = () => {
  const [{ data: userData, loading }] = useAxios('/api/user/info', { manual: false });
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(state => !state);
  if (loading) {
    return <Spin />;
  }
  const user = userData.user as User;
  return (
    <Row>
      <Col span={8} />{' '}
      <Col span={8}>
        <h1>
          Hi,{' '}
          {user.username
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
      {showModal && <ScanModal isOpen={showModal} toggleModal={toggleModal} />}
    </Row>
  );
};

Home.propTypes = {};

export default Home;
