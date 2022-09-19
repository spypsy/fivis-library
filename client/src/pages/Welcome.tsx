import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Result, Row, Space, Col } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <Row>
      <Col span="24">
        <Result
          icon={<BookOutlined />}
          title={"Welcome to Fivi's Library!"}
          extra={
            <Button type="primary">
              <Link to="/login">Login Here</Link>
            </Button>
          }
        />
      </Col>
    </Row>
  );
};

Welcome.propTypes = {};

export default Welcome;
