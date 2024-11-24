import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import BasicLayout from '../layouts/BasicLayout';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Users = lazy(() => import('../pages/Users')); 
const Admin = lazy(() => import('../pages/Admin'));
const Posts = lazy(() => import('../pages/Posts'));
const AI = lazy(() => import('../pages/AI'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const UserActions = lazy(() => import('../pages/UserActions'));
const Banners = lazy(() => import('../pages/Resources/Banners'));
const Emojis = lazy(() => import('../pages/Resources/Emojis'));

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
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <AI />
          </Suspense>
        ),
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
    ],
  },
]);