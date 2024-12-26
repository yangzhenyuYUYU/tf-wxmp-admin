const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';

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
  LogoutOutlined,
  MessageOutlined
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
    navigate(`${BASE_PATH}/login`);
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
        <Link to={item.path || `${BASE_PATH}/`}>{dom}</Link>
      )}
      breadcrumbRender={(routers = []) => [
        {
          path: `${BASE_PATH}/`,
          title: '首页',
        },
        ...routers,
      ]}
      route={{
        path: `${BASE_PATH}/`,
        routes: [
          {
            path: `${BASE_PATH}/dashboard`,
            name: '控制台',
            icon: <DashboardOutlined />,
          },
          {
            path: `${BASE_PATH}/users`,
            name: '用户管理',
            icon: <TeamOutlined />,
          },
          {
            path: `${BASE_PATH}/admin`,
            name: '管理员管理',
            icon: <TeamOutlined />,
          },
          {
            path: `${BASE_PATH}/posts`,
            name: '内容管理',
            icon: <FileTextOutlined />,
          },
          {
            path: `${BASE_PATH}/feedback`,
            name: '反馈管理',
            icon: <MessageOutlined />,
          },
          {
            path: `${BASE_PATH}/announcements`,
            name: '公告通知',
            icon: <NotificationOutlined />,
          },
          {
            path: `${BASE_PATH}/user-actions`,
            name: '用户操作',
            icon: <InteractionOutlined />,
          },
          {
            path: `${BASE_PATH}/categories`,
            name: '分类管理',
            icon: <AppstoreOutlined />,
          },
          {
            path: `${BASE_PATH}/resources`,
            name: '资源管理',
            icon: <PictureOutlined />,
            routes: [
              {
                path: `${BASE_PATH}/resources/emojis`,
                name: '表情包管理',
              },
              {
                path: `${BASE_PATH}/resources/banners`,
                name: '轮播图管理',
              },
            ],
          },
          {
            path: `${BASE_PATH}/knowledge`,
            name: 'AI知识库',
            icon: <RobotOutlined />,
            routes: [
              {
                path: `${BASE_PATH}/knowledge/datasets`,
                name: '知识库',
              },
              {
                path: `${BASE_PATH}/knowledge/slices`,
                name: '切片库',
              },
              {
                path: `${BASE_PATH}/knowledge/materials`,
                name: '资料库',
              },
              {
                path: `${BASE_PATH}/knowledge/settings`,
                name: '高级设置',
              }
            ],
          },
          {
            path: `${BASE_PATH}/ai-settings`,
            name: 'AI信息管理',
            icon: <RobotOutlined />,
            routes: [
              {
                path: `${BASE_PATH}/ai-settings/responses`,
                name: 'AI回复管理',
              },
              {
                path: `${BASE_PATH}/ai-settings/llm-models`,
                name: '语言模型管理',
              },
              {
                path: `${BASE_PATH}/ai-settings/ocr-models`,
                name: '图像识别模型',
              },
              {
                path: `${BASE_PATH}/ai-settings/models`,
                name: '知识库模型管理',
              },
              // {
              //   path: `${BASE_PATH}/ai-settings/consumption`,
              //   name: 'AI消费统计',
              // },

            ],
          },
          {
            path: `${BASE_PATH}/teachers`,
            name: '教师管理',
            icon: <TeamOutlined />,
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