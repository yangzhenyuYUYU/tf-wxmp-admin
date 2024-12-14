import { ApiResponse, http } from '../utils/request';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PROFESSOR = 'professor',
  ADMIN = 'admin',
  ASSISTANT = 'assistant',
  RESEARCHER = 'researcher',
  USER = 'user',
  DEFAULT = 'default'
}

export enum UserRoleLabel {
  STUDENT = '学生',
  TEACHER = '教师',
  PROFESSOR = '教授',
  ADMIN = '管理员',
  ASSISTANT = '助教',
  RESEARCHER = '研究员',
  USER = '普通用户',
  DEFAULT = '默认用户'
}

export enum AccountStatus {
  NORMAL = 1,
  REMOVE = -1
}

export interface User {
  id: number;
  user_id: string;
  nickname: string;
  real_name: string | null;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  gender: number;
  role: UserRole;
  is_verified: boolean;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
  email: string | null;
}

export interface UserListParams {
  page: number;
  size: number;
  role?: string;
  status?: number;
  keyword?: string;
}

export interface UserUpdateParams {
  role?: string;
  status?: number;
  is_verified?: boolean;
}

interface UserListResponse {
  total: number;
  items: User[];
}

export const userApi = {
  getUsers: (params: UserListParams) =>
    http.get<ApiResponse<UserListResponse>>('/users/list', { params }),

  updateUser: (userId: string, data: UserUpdateParams) =>
    http.put<ApiResponse<null>>(`/users/${userId}`, data),
}; 