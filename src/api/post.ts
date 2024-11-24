import { ApiResponse, http } from '../utils/request';

export interface PostItem {
  id: number;
  title: string;
  user: {
    user_id: string;
    nickname: string;
  };
  view_count: number;
  like_count: number;
  comment_count: number;
  favorite_count: number;
  is_excellent: boolean;
  created_at: string;
  has_ai_reply: boolean;
  ai_reply_count: number;
}

interface PostListResponse {
  total: number;
  items: PostItem[];
}

export interface PostListParams {
  page: number;
  size: number;
  category_id?: number;
  is_excellent?: boolean;
  keyword?: string;
}

export const postApi = {
  getPosts: (params: PostListParams) =>
    http.get<ApiResponse<PostListResponse>>('/posts/list', { params }),

  setExcellent: (post_id: number, is_excellent: boolean) =>
    http.put<ApiResponse<null>>(`/posts/${post_id}/excellent`, { is_excellent }),
};