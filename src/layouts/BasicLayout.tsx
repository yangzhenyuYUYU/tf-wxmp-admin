import { ProLayout } from '@ant-design/pro-components';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  RobotOutlined,
  InteractionOutlined,
  PictureOutlined,
  NotificationOutlined,
  AppstoreOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import logo from '@/assets/logo.png';
import { Button, Tag, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const BasicLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    message.success('退出登录成功');
    navigate('/login');
  };

  return (
    <ProLayout
      title="学生问答管理系统"
      logo={logo}
      layout="mix"
      splitMenus={true}
      fixedHeader
      fixSiderbar
      location={location}
      token={{
        colorPrimary: '#135200',
        sider: {
          colorMenuBackground: '#fff',
          colorTextMenu: '#595959',
          colorTextMenuSelected: '#135200',
          colorBgMenuItemSelected: '#f6ffed'
        },
        header: {
          colorBgHeader: '#fff',
          colorTextMenuSelected: '#135200',
          colorBgMenuItemSelected: '#f6ffed'
        }
      }}
      menu={{
        type: 'sub',
        defaultOpenAll: true,
      }}
      avatarProps={{
        src: userInfo.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        size: 'small',
        title: userInfo.username,
        render: (_, dom) => {
          return (
            <Space>
              {dom}
              <Tag color="green">{userInfo.role === 'admin' ? '管理员' : '普通用户'}</Tag>
            </Space>
          );
        },
      }}
      actionsRender={() => {
        return [
          <Button 
            key="logout"
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
          >
            退出登录
          </Button>
        ];
      }}
      menuItemRender={(item, dom) => (
        <Link to={item.path || '/'}>{dom}</Link>
      )}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          title: '首页',
        },
        ...routers,
      ]}
      route={{
        path: '/',
        routes: [
          {
            path: '/dashboard',
            name: '控制台',
            icon: <DashboardOutlined />,
          },
          {
            path: '/users',
            name: '用户管理',
            icon: <TeamOutlined />,
          },
          {
            path: '/admin',
            name: '管理员管理',
            icon: <TeamOutlined />,
          },
          {
            path: '/posts',
            name: '内容管理',
            icon: <FileTextOutlined />,
          },
          {
            path: '/announcements',
            name: '公告通知',
            icon: <NotificationOutlined />,
          },
          {
            path: '/user-actions',
            name: '用户操作',
            icon: <InteractionOutlined />,
          },
          {
            path: '/categories',
            name: '分类管理',
            icon: <AppstoreOutlined />,
          },
          {
            path: '/resources',
            name: '资源管理',
            icon: <PictureOutlined />,
            routes: [
              {
                path: '/resources/emojis',
                name: '表情包管理',
              },
              {
                path: '/resources/banners',
                name: '轮播图管理',
              },
            ],
          },
          {
            path: '/knowledge',
            name: 'AI知识库',
            icon: <RobotOutlined />,
            routes: [
              {
                path: '/knowledge/bases',
                name: '知识库',
              },
              {
                path: '/knowledge/slices',
                name: '切片库',
              },
              {
                path: '/knowledge/materials',
                name: '资料库',
              },
              {
                path: '/knowledge/settings',
                name: '高级设置',
              }
            ],
          },
          {
            path: '/ai-settings',
            name: 'AI信息管理',
            icon: <RobotOutlined />,
            routes: [
              {
                path: '/ai-settings/responses',
                name: 'AI回复管理',
              },
              {
                path: '/ai-settings/ocr-models',
                name: '图像识别模型',
              },
              {
                path: '/ai-settings/models',
                name: '知识库模型管理',
              },
              // {
              //   path: '/ai-settings/consumption',
              //   name: 'AI消费统计',
              // },

            ],
          },
        ],
      }}
    >
      <div style={{ padding: '20px' }}>
        <Outlet />
      </div>
    </ProLayout>
  );
};

export default BasicLayout;