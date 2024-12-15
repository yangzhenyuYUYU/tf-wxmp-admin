import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import BasicLayout from '../layouts/BasicLayout';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Users = lazy(() => import('../pages/Users')); 
const Admin = lazy(() => import('../pages/Admin'));
const Posts = lazy(() => import('../pages/Posts'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const UserActions = lazy(() => import('../pages/UserActions'));
const Banners = lazy(() => import('../pages/Resources/Banners'));
const Emojis = lazy(() => import('../pages/Resources/Emojis'));
const Announcements = lazy(() => import('../pages/Announcements'));
const Categories = lazy(() => import('../pages/Categories'));
const Materials = lazy(() => import('../pages/Knowledge/Materials'));
const Slices = lazy(() => import('../pages/Knowledge/Slices'));
const Datasets = lazy(() => import('../pages/Knowledge/Datasets'));
const Processors = lazy(() => import('../pages/Knowledge/Processors'));
const Settings = lazy(() => import('../pages/Knowledge/Settings'));
const Models = lazy(() => import('../pages/AI/Models'));
const Keys = lazy(() => import('../pages/AI/Keys'));
const Consumption = lazy(() => import('../pages/AI/Consumption'));
const Responses = lazy(() => import('../pages/AI/Responses'));
const OCRModel = lazy(() => import('../pages/AI/OCRModel'));
const LLMModel = lazy(() => import('../pages/AI/LLMModel'));

// 根据错误提示,这些组件标红的原因是:
// 1. 有些组件文件虽然创建了,但是没有正确导出默认导出(export default)
// 2. 有些组件文件可能不存在或TypeScript找不到对应的类型声明
// 
// 解决方案:
// 1. 确保所有组件文件都有 export default 导出
// 2. 检查文件路径是否正确
// 3. 如果是 TypeScript 项目,需要有正确的类型声明

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<div>加载中...</div>}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<div>加载中...</div>}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Admin />
          </Suspense>
        ),
      },
      {
        path: 'posts',
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Posts />
          </Suspense>
        ),
      },
      {
        path: 'ai-settings',
        children: [
          {
            path: '',
            element: <Navigate to="models" replace />,
          },
          {
            path: 'models',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Models />
              </Suspense>
            ),
          },
          {
            path: 'keys',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Keys />
              </Suspense>
            ),
          },
          {
            path: 'consumption',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Consumption />
              </Suspense>
            ),
          },
          {
            path: 'responses',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Responses />
              </Suspense>
            ),
          },
          {
            path: 'ocr-models',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <OCRModel />
              </Suspense>
            ),
          },
          {
            path: 'llm-models',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <LLMModel />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'user-actions',
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <UserActions />
          </Suspense>
        ),
      },
      {
        path: 'resources',
        children: [
          {
            path: '',
            element: <Navigate to="emojis" replace />,
          },
          {
            path: 'banners',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Banners />
              </Suspense>
            ),
          },
          {
            path: 'emojis',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Emojis />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'knowledge',
        children: [
          {
            path: '',
            element: <Navigate to="datasets" replace />,
          },
          {
            path: 'materials',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Materials />
              </Suspense>
            ),
          },
          {
            path: 'slices',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Slices />
              </Suspense>
            ),
          },
          {
            path: 'datasets',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Datasets />
              </Suspense>
            ),
          },
          {
            path: 'processors',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Processors />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<div>加载中...</div>}>
                <Settings />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'announcements',
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Announcements />
          </Suspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Categories />
          </Suspense>
        ),
      },
    ],
  },
]);