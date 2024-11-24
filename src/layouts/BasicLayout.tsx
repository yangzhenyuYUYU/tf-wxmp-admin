import { ProLayout } from '@ant-design/pro-components';
import { Link, Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  RobotOutlined,
  InteractionOutlined,
  PictureOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import logo from '@/assets/logo.png';

const BasicLayout = () => {
  const routes = {
    route: {
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
          path: '/announcements',
          name: '公告通知',
          icon: <NotificationOutlined />,
        },
        {
          path: '/ai-settings',
          name: 'AI设置',
          icon: <RobotOutlined />,
        },
        {
          path: '/user-actions',
          name: '用户操作',
          icon: <InteractionOutlined />,
        },
      ],
    },
  };

  return (
    <ProLayout
      title="学生问答管理系统"
      logo={logo}
      route={routes.route}
      menuItemRender={(item, dom) => (
        <Link to={item.path || '/'}>{dom}</Link>
      )}
    >
      <Outlet />
    </ProLayout>
  );
};

export default BasicLayout;