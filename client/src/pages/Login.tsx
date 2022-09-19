import React, { useEffect } from 'react';
import { Button, Col, Form, Input, Row } from 'antd';
import useAxios from 'axios-hooks';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

const Login = ({ history }: RouteComponentProps) => {
  const [
    { data: loginData, loading: loginLoading, error: loginError },
    postLogin,
  ] = useAxios(
    {
      url: '/api/user/login',
      method: 'POST',
    },
    { manual: true },
  );

  const [, setUser] = useLocalStorage('user', {});

  useEffect(() => {
    if (loginData?.id) {
      setUser(loginData);
      history.push('/home');
    }
  }, [loginData, history, setUser]);

  const onFinish = (values: any) => {
    console.log('posting', values);
    postLogin({ data: { ...values } });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="page login">
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
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loginLoading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default withRouter(Login);
