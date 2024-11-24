import { ApiResponse, http } from '../utils/request';

const API_PREFIX = '/dashboard';

export interface DashboardOverview {
  total_users: number;
  total_posts: number;
  new_users: number;
  new_posts: number;
  today_ai_replies: number;
}

export interface ActiveUser {
  userId: string;
  nickname: string;
  action_count: number;
  last_active_time: string;
}

export interface HotPost {
  post_id: string;
  title: string;
  view_count: number;
  comment_count: number;
  create_time: string;
}

interface ListResponse<T> {
  list: T[];
  total: number;
}

export const dashboardApi = {
  getOverview: () => 
    http.get<ApiResponse<DashboardOverview>>(`${API_PREFIX}/overview`),
    
  getActiveUsers: (params: { page: number; size: number }) =>
    http.get<ApiResponse<ListResponse<ActiveUser>>>(`${API_PREFIX}/active-users`, { params }),
    
  getHotPosts: (params: { page: number; size: number }) =>
    http.get<ApiResponse<ListResponse<HotPost>>>(`${API_PREFIX}/hot-posts`, { params }),
}; 