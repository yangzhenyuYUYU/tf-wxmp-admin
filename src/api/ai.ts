import { http } from '../utils/request';

const API_PREFIX = '/ai';

export interface AiStatistics {
  totalUsage: number;
  todayUsage: number;
  averageResponseTime: number;
  successRate: number;
}

export interface AiRecord {
  recordId: string;
  userId: string;
  query: string;
  response: string;
  responseTime: number;
  status: 'success' | 'failed';
  createTime: string;
}

export const aiApi = {
  getStatistics: () =>
    http.get<AiStatistics>(`${API_PREFIX}/statistics`),
    
  getRecords: (params: {
    page: number;
    size: number;
    status?: 'success' | 'failed';
    startDate?: string;
    endDate?: string;
  }) => http.get<AiRecord[]>(`${API_PREFIX}/records`, { params }),
}; 