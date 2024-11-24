import { http } from '../utils/request';

const API_PREFIX = '/announcements';

export interface Announcement {
  noticeId: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  createTime: string;
  updateTime: string;
}

export interface CreateAnnouncementParams {
  title: string;
  content: string;
  status: 'draft' | 'published';
}

export const announcementApi = {
  getAnnouncements: (params: { page: number; size: number }) =>
    http.get<Announcement[]>(`${API_PREFIX}/list`, { params }),
    
  createAnnouncement: (data: CreateAnnouncementParams) =>
    http.post<Announcement>(API_PREFIX, data),
    
  updateAnnouncement: (noticeId: string, data: Partial<CreateAnnouncementParams>) =>
    http.put(`${API_PREFIX}/${noticeId}`, data),
    
  deleteAnnouncement: (noticeId: string) =>
    http.delete(`${API_PREFIX}/${noticeId}`),
}; 