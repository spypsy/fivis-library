import { Button, Col, Form, Input, Row, message } from 'antd';
import useAxios from 'axios-hooks';
import React, { useEffect } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { User } from 'types';
import { useLocalStorage } from 'usehooks-ts';

const Login = ({ history }: RouteComponentProps) => {
  const [{ data: loginData, loading: loginLoading, error }, postLogin] = useAxios<{ user: User }>(
    {
      url: '/api/user/login',
      method: 'POST',
    },
    { manual: true },
  );

  const [, setUser] = useLocalStorage<User>('user', {});

  useEffect(() => {
    if (error) {
      message.error(error.response?.data?.message || error.message);
    }
    if (loginData?.user?.id) {
      setUser(loginData.user);
      history.push('/home');
      message.success(`Logged in as ${loginData.user.username}`);
    }
  }, [loginData, history, setUser, error]);

  const onFinish = (values: any) => {
    postLogin({ data: { ...values } });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="page login">
      <Row>
        <Col span={8} />
        <Col span={8}>
          <h2>Login</h2>
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
              <Button type="primary" htmlType="submit" loading={loginLoading}>
                Submit
              </Button>
              <br />
              <Link to="/register">Or Sign Up here...</Link>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default withRouter(Login);
