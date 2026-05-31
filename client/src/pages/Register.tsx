import { Button, Card, Form, Input, Typography, message } from 'antd';
import useAxios from 'axios-hooks';
import PageShell from 'components/PageShell';
import { notifyAuthChanged } from 'hooks/authSession';
import React, { useEffect } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { User } from 'types';
import { useLocalStorage } from 'usehooks-ts';

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

  const [, setUser] = useLocalStorage<User | null>('user', null);

  useEffect(() => {
    if (registerData?.user?.id) {
      setUser(registerData.user);
      notifyAuthChanged();
      message.success('Account created!');
      history.push('/home');
    }
    if (signupError) {
      message.error(signupError.response?.data?.message || signupError.message);
    }
  }, [registerData, history, signupError, setUser]);

  const onFinish = (values: { username: string; password: string }) => {
    postRegisterData({ data: { ...values } });
  };

  return (
    <PageShell narrow>
      <Card title="Sign up">
        <Form name="register" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please choose a username' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please choose a password' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={registerLoading} block>
              Create account
            </Button>
          </Form.Item>
          <Typography.Text>
            Already have an account? <Link to="/login">Log in</Link>
          </Typography.Text>
        </Form>
      </Card>
    </PageShell>
  );
};

export default withRouter(Register);
