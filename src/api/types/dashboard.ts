// 统计数据类型
export interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  todayConversations: number;
}

// 每日数据类型
export interface DailyData {
  date: string;
  conversations: number;
  questions: number;
  users: number;
}

// 响应数据类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
} 