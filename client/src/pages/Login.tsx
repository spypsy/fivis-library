import { Button, Card, Form, Input, Typography, message } from 'antd';
import useAxios from 'axios-hooks';
import PageShell from 'components/PageShell';
import { notifyAuthChanged } from 'hooks/authSession';
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

  const [, setUser] = useLocalStorage<User | null>('user', null);

  useEffect(() => {
    if (error) {
      message.error(error.response?.data?.message || error.message);
    }
    if (loginData?.user?.id) {
      setUser(loginData.user);
      notifyAuthChanged();
      history.push('/home');
      message.success(`Logged in as ${loginData.user.username}`);
    }
  }, [loginData, history, setUser, error]);

  const onFinish = (values: { username: string; password: string }) => {
    postLogin({ data: { ...values } });
  };

  return (
    <PageShell narrow>
      <Card title="Log in">
        <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loginLoading} block>
              Log in
            </Button>
          </Form.Item>
          <Typography.Text>
            New here? <Link to="/register">Create an account</Link>
          </Typography.Text>
        </Form>
      </Card>
    </PageShell>
  );
};

export default withRouter(Login);
