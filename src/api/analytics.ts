import { http } from '../utils/request';

const API_PREFIX = '/analytics';

export interface UserGrowth {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface UserActions {
  date: string;
  posts: number;
  comments: number;
  likes: number;
}

export interface ContentStats {
  totalPosts: number;
  totalComments: number;
  totalCategories: number;
  excellentPosts: number;
}

export interface MonthlyStats {
  month: string;
  activeUsers: number;
  newPosts: number;
  newComments: number;
  aiUsage: number;
}

export const analyticsApi = {
  getUserGrowth: (params: { startDate: string; endDate: string }) =>
    http.get<UserGrowth[]>(`${API_PREFIX}/user-growth`, { params }),
    
  getUserActions: (params: { startDate: string; endDate: string }) =>
    http.get<UserActions[]>(`${API_PREFIX}/user-actions`, { params }),
    
  getContentStats: () =>
    http.get<ContentStats>(`${API_PREFIX}/content-stats`),
    
  getMonthlyStats: (params: { year: number; month: number }) =>
    http.get<MonthlyStats>(`${API_PREFIX}/monthly-stats`, { params }),
}; 