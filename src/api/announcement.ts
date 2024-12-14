import { ApiResponse, http } from '../utils/request';

const API_PREFIX = '/announcements';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: number;
  status: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface CreateAnnouncementParams {
  title: string;
  content: string;
  type?: number;
  status: number;
  user_id?: string;
}

export interface AnnouncementListResponse {
  data: {
    items: Announcement[];  
    total: number;
  }
}

export const announcementApi = {
  getAnnouncements: (params: { page: number; size: number }) =>
    http.get<ApiResponse<{items: Announcement[], total: number}>>(`${API_PREFIX}/list`, { params }),
    
  createAnnouncement: (data: CreateAnnouncementParams) =>
    http.post<Announcement>(API_PREFIX + '/', data),
    
  updateAnnouncement: (noticeId: string, data: Partial<CreateAnnouncementParams>) =>
    http.put(`${API_PREFIX}/${noticeId}`, data),
    
  deleteAnnouncement: (noticeId: string) =>
    http.delete(`${API_PREFIX}/${noticeId}`),
}; 