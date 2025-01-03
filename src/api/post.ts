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
  images: string[];
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

export interface PostDetail {
  post: {
    id: number;
    title: string;
    content: string;
    categories: Array<{
      id: number;
      name: string;
      key: string;
    }>;
    images: string[];
    like_count: number;
    comment_count: number;
    favorite_count: number;
    view_count: number;
    created_at: string;
    updated_at: string | null;
  };
  ai_reply_info: {
    id: number;
    content: string;
    model_type: string;
    total_tokens: number;
    processing_time: number;
    rating: number;
    status: string;
    created_at: string;
    completed_at: string | null;
  } | null;
}

export const postApi = {
  getPosts: (params: PostListParams) =>
    http.get<ApiResponse<PostListResponse>>('/posts/list', { params }),

  setExcellent: (post_id: number, is_excellent: boolean) =>
    http.put<ApiResponse<null>>(`/posts/${post_id}/excellent`, { is_excellent }),
    
  deletePost: (post_id: number) =>
    http.delete<ApiResponse<null>>(`/posts/${post_id}`),

  getPostDetail: (post_id: number) =>
    http.get<ApiResponse<PostDetail>>(`/posts/${post_id}/detail`),
};