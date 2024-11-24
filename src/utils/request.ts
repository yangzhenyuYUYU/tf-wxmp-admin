import axios, { AxiosRequestConfig } from 'axios';
import { message } from 'antd';

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

const request = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin`,
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    // 处理 HTTP 状态码错误
    switch (response?.status) {
      case 401:
        message.error('请重新登录');
        // 清除token并跳转登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        message.error('没有权限');
        break;
      case 404:
        message.error('资源不存在');
        break;
      case 400:
        message.error('请求参数错误');
        break;
      default:
        message.error(response?.data?.msg || '服务器错误');
    }
    
    return Promise.reject(error);
  }
);

// 封装 GET 请求
const get = <T = any>(url: string, config?: AxiosRequestConfig) => {
  return request.get<any, T>(url, config);
};

// 封装 POST 请求
const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return request.post<any, T>(url, data, config);
};

// 封装 PUT 请求
const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return request.put<any, T>(url, data, config);
};

// 封装 DELETE 请求
const del = <T = any>(url: string, config?: AxiosRequestConfig) => {
  return request.delete<any, T>(url, config);
};

export const http = {
  get,
  post,
  put,
  delete: del,
};

// 导出类型
export type { ApiResponse }; 