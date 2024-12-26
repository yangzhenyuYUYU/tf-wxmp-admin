import { ApiResponse, http } from '../utils/request';

interface ResponseRate {
  month1: number;
  month3: number;
  year1: number;
}

interface WaitTime {
  month1: number;
  month3: number;
  year1: number;
}

interface TeacherListItem {
  id: string;
  username: string;
  categories: string[];
  last_login_time: string;
  response_rate: ResponseRate;
  avg_wait_time: WaitTime;
}

interface TeacherListResponse {
  total: number;
  items: TeacherListItem[];
}

interface TeacherDetailResponse {
  id: string;
  username: string;
  real_name?: string;
  phone?: string;
  email?: string;
  categories: string[];
  status: number;
  created_at: string;
}

interface TeacherCreateRequest {
  username: string;
  real_name: string;
  phone?: string;
  email?: string;
  password: string;
  category_ids: number[];
}

interface TeacherUpdateRequest {
  real_name?: string;
  phone?: string;
  email?: string;
  password?: string;
  category_ids?: number[];
  status?: number;
}

export const teacherApi = {
  getTeacherList: (params?: { page?: number; size?: number; keyword?: string; category_id?: number }) =>
    http.get<ApiResponse<TeacherListResponse>>('/teachers/list', { params }),

  getTeacherDetail: (id: string) =>
    http.get<ApiResponse<TeacherDetailResponse>>(`/teachers/${id}`),

  createTeacher: (data: TeacherCreateRequest) =>
    http.post<ApiResponse<{ id: string }>>('/teachers/create', data),

  updateTeacher: (id: string, data: TeacherUpdateRequest) =>
    http.put<ApiResponse<null>>(`/teachers/${id}`, data),

  deleteTeacher: (id: string) =>
    http.delete<ApiResponse<null>>(`/teachers/${id}`),
};