import { useState } from 'react';
import { Button, Form, Input, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, RegisterParams } from '../../api/auth';
import styles from './index.module.less';
import logo from '../../assets/logo.png';
import ImageCaptcha from '../../components/ImageCaptcha';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [captchaCode, setCaptchaCode] = useState('');

  const onFinish = async (values: RegisterParams & { captcha: string }) => {
    if (values.captcha.toLowerCase() !== captchaCode.toLowerCase()) {
      message.error('验证码错误');
      return;
    }

    setLoading(true);
    try {
      const { code, data } = await authApi.register(values);
      console.log('注册响应:', { code, data });
      
      if (!data || code !== 0) return;
      
      message.success('注册成功');
      navigate(`${BASE_PATH}/login`, { replace: true });
      
    } catch (error: any) {
      console.error('注册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h2 className={styles.title}>账号注册</h2>
          <p className={styles.subtitle}>欢迎加入我们</p>
        </div>
        
        <Form
          name="register"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="确认密码"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="captcha"
            rules={[{ required: true, message: '请输入验证码!' }]}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input 
                placeholder="请输入验证码" 
                style={{ flex: 1 }}
                disabled={loading}
              />
              <div style={{ marginLeft: 8 }}>
                <ImageCaptcha
                  width={120}
                  height={40}
                  onChange={(code) => setCaptchaCode(code)}
                />
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          已有账号？
          <Link to={`${BASE_PATH}/login`} className={styles.link}>
            立即登录
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;