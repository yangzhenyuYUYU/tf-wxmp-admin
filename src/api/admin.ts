import { ApiResponse, http } from '../utils/request';

// 枚举定义
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator'
}

export enum AdminStatus {
  NORMAL = 1,
  DISABLED = 0,
  REMOVED = -1
}

// 接口定义
export interface AdminInfo {
  id: number;
  username: string;
  real_name: string | null;
  role: AdminRole;
  status: AdminStatus;
  last_login: string | null;
  created_at: string;
}

interface AdminListResponse {
  total: number;
  items: AdminInfo[];
  page: number;
  size: number;
}

export interface AdminUpdateParams {
  real_name?: string;
  role?: string;
  status?: number;
}

// API 方法定义
export const adminApi = {
  // 获取管理员列表
  getAdmins: (params: { page: number; size: number }) =>
    http.get<ApiResponse<AdminListResponse>>('/admins/list', { params }),
    
  // 更新管理员信息
  updateAdmin: (adminId: number, data: AdminUpdateParams) =>
    http.put<ApiResponse<AdminInfo>>(`/admins/${adminId}`, data),
    
  // 删除管理员
  deleteAdmin: (adminId: number) =>
    http.delete<ApiResponse<null>>(`/admins/${adminId}`),
}; 