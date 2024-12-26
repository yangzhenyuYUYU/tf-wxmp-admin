import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, LoginParams } from '../../api/auth';
import styles from './index.module.less';
import { useState } from 'react';
import logo from '../../assets/logo.png';
import ImageCaptcha from '../../components/ImageCaptcha';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';
const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');

  const onFinish = async (values: LoginParams & { captcha: string }) => {
    if (values.captcha.toLowerCase() !== captchaCode.toLowerCase()) {
      message.error('验证码错误');
      return;
    }
    
    setLoading(true);
    try {
      const { code, data } = await authApi.login(values);
      console.log('登录响应:', { code, data });
      
      if (!data || code !== 0) return;
      
      const { access_token, refresh_token, system_token, admin_info } = data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token); 
      localStorage.setItem('userInfo', JSON.stringify(admin_info));
      localStorage.setItem('system_token', system_token);
      message.success('登录成功');
      navigate(`/`, { replace: true });
      
    } catch (error: any) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h2 className={styles.title}>管理系统</h2>
          <p className={styles.subtitle}>欢迎回来，请登录您的账号</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码"
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
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          还没有账号？
          <Link to={`${BASE_PATH}/register`} className={styles.link}>
            立即注册
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;