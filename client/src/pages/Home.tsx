import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocalStorage } from 'usehooks-ts';
import { User } from 'types';
import { Button, Col, Row } from 'antd';
import ScanModal from 'components/ScanModal';

const Home = () => {
  const [user] = useLocalStorage<User>('user', {});
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal((state) => !state);
  return (
    <Row>
      <Col span={8} />{' '}
      <Col span={8}>
        <h1>Hi, {user.username}!</h1>
        <h1>Ready to scan some books?</h1>
        <Button type="primary" onClick={toggleModal}>
          Click here!
        </Button>
      </Col>
      <Col span={8} />
      <ScanModal isOpen={showModal} toggleModal={toggleModal} />
    </Row>
  );
};

Home.propTypes = {};

export default Home;
