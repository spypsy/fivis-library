import { BookOutlined } from '@ant-design/icons';
import { Button, Card, Col, Result, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <Row>
      <Col span="24">
        <Result
          icon={<BookOutlined />}
          title={"Welcome to Fivi's Library!"}
          extra={
            <>
              <Button type="primary">
                <Link to="/login">Login</Link>
              </Button>
              <Button type="primary">
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          }
        />
      </Col>
    </Row>
  );
};

Welcome.propTypes = {};

export default Welcome;
