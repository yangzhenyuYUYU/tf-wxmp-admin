import axios, { AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { AESUtil } from './aes';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';

// 添加一个标记来追踪是否正在处理401错误
let isHandling401 = false;
// 存储待处理的请求队列
let pendingRequests: Array<() => void> = [];

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
    // 如果正在处理401，则阻止新的请求
    if (isHandling401) {
      return new Promise((_, reject) => {
        pendingRequests.push(() => reject(new Error('请求已取消')));
      });
    }

    // 对非上传请求进行加密
    if (config.url && !config.url.startsWith('/upload')) {
      if (config.data && typeof config.data === 'object') {
        config.data = {
          encrypted: AESUtil.encrypt(config.data)
        };
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const systemToken = localStorage.getItem('system_token');
    if (systemToken) {
      config.headers.SystemToken = systemToken;
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
    // 对非上传请求进行解密
    if (response.config.url && !response.config.url.startsWith('/upload')) {
      if (response.data && response.data.encrypted) {
        try {
          return AESUtil.decrypt(response.data.encrypted);
        } catch (error) {
          console.error('解密响应数据失败:', error);
          return response.data;
        }
      }
    }
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    // 处理 HTTP 状态码错误
    switch (response?.status) {
      case 401:
        if (!isHandling401) {
          isHandling401 = true;
          message.error('请重新登录');
          
          // 清除token并跳转登录页
          setTimeout(() => {
            localStorage.removeItem('token');
            // 清空待处理的请求队列
            pendingRequests.forEach(reject => reject());
            pendingRequests = [];
            window.location.href = `${BASE_PATH}/login`;
            isHandling401 = false;
          }, 1000);
        }
        break;
      case 403:
        message.error('没有权限');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = `${BASE_PATH}/login`;
        }, 1000);
        break;
      case 404:
        message.error('资源不存在');
        break;
      case 400:
        message.error('请求参数错误');
        break;
      default:
        let errorMsg = response?.data?.msg || '服务器错误';
        if (errorMsg.length > 100) {
          errorMsg = '服务器异常错误';
        }
        message.error(errorMsg);
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