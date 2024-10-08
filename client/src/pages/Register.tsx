import { Button, Col, Form, Input, Row, message } from 'antd';
import useAxios from 'axios-hooks';
import React, { useEffect } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { User } from 'types';

const Register = ({ history }: RouteComponentProps) => {
  const [{ data: registerData, loading: registerLoading, error: signupError }, postRegisterData] = useAxios<{
    user: User;
  }>(
    {
      url: '/api/user/register',
      method: 'POST',
    },
    { manual: true },
  );

  useEffect(() => {
    if (registerData?.user?.id) {
      message.success('User created! Please login.', 0.5);
      history.push('/login');
    }
    if (signupError) {
      message.error(`Something went wrong: ${signupError.message}`);
    }
  }, [registerData, history, signupError]);

  const onFinish = (values: any) => {
    postRegisterData({ data: { ...values } });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="page register">
      <Row>
        <Col span={8} />
        <Col span={8}>
          <h2>Sign Up</h2>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={registerLoading}>
                Submit
              </Button>
              <br />
              Already a user? <Link to="/login">Log in here...</Link>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default withRouter(Register);
