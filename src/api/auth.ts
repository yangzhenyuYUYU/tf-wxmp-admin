import { http } from '../utils/request';
import CryptoUtil from '../utils/crypto';

const API_PREFIX = '/auth';

// 接口返回类型定义
export interface UserInfo {
  user_id: string;
  email?: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  role?: string;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  admin_info: UserInfo;
  system_token: string;
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T | null;
}

// 请求参数类型定义
export interface LoginParams {
  username: string;
  password: string;
  sec_code?: string; // 加密后的密码字段
}

export interface RegisterParams {
  username: string;
  password: string;
  confirm_password: string;
}

// API 接口定义
export const authApi = {
  // 密码登录
  login: (data: LoginParams) => {
    const params = {
      ...data,
      sec_code: CryptoUtil.aesEncrypt(
        data.password,
        import.meta.env.VITE_SEC_KEY
      )
    };
    return http.post<ApiResponse<LoginResult>>(`${API_PREFIX}/login`, params);
  },
  
  // 密码注册  
  register: (data: RegisterParams) =>
    http.post<ApiResponse<{ user_id: string }>>(`${API_PREFIX}/register`, data),
    
  // 退出登录
  logout: () => 
    http.post<void>(`${API_PREFIX}/logout`),
    
  // 获取当前用户信息
  getCurrentUser: () =>
    http.get<ApiResponse<UserInfo>>(`${API_PREFIX}/user/current`),
};  