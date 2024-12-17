import { ApiResponse, http } from '../utils/request';

export interface Feedback {
  id: number;
  content: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface FeedbackListResponse {
  total: number;
  items: Feedback[];
}

export const feedbackApi = {
  // 获取反馈列表
  getFeedbacks: () => 
    http.get<ApiResponse<FeedbackListResponse>>('/feedback/list'),

  // 更新反馈状态
  updateFeedbackStatus: (feedbackId: number, status: number) =>
    http.put<ApiResponse<Feedback>>('/feedback/update', { feedback_id: feedbackId, status }),

  // 删除反馈
  deleteFeedback: (feedbackId: number) =>
    http.delete<ApiResponse<null>>('/feedback/delete', { params: { feedback_id: feedbackId } })
};
