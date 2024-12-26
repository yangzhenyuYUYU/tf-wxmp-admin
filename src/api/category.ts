import { http } from '../utils/request';

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface Category {
  id: number;
  name: string;
  key: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  has_teachers: boolean;
  knowledge_base_id?: number | string;
}

export interface CategoryStats {
  total_levels: number;
  level_counts: Record<number, number>;
}

export interface CategoryCreateParams {
  name: string;
  key: string;
  sort_order?: number;
}

export interface CategoryUpdateParams {
  name?: string;
  key?: string;
  knowledge_base_id?: number | string;
  sort_order?: number;
}

export interface LevelStats {
  total_levels: number;
  level_counts: Record<string, number>;
}

export interface Teacher {
  id: number;
  user_id: number;
  nickname: string;
  real_name: string;
  avatar: string;
  is_active: boolean;
}

export const categoryApi = {
  // 获取分类列表
  getCategories: (params: { 
    page: number; 
    size: number; 
    level?: number;
    sort_field?: string;
    sort_order?: 'ascend' | 'descend';
  }) => http.get<ApiResponse<{items: Category[], total: number}>>('/categories', { params }),

  // 获取分类统计信息
  getCategoryStats: () =>
    http.get<ApiResponse<CategoryStats>>('/categories/stats'),

  // 获取指定层级的分类
  getCategoriesByLevel: (level: number) =>
    http.get<ApiResponse<Category[]>>(`/categories/level/${level}`),

  // 创建分类
  createCategory: (data: CategoryCreateParams) =>
    http.post<ApiResponse<Category>>('/categories', data),

  // 更新分类
  updateCategory: (id: number, data: CategoryUpdateParams) =>
    http.put<ApiResponse<Category>>(`/categories/${id}`, data),

  // 删除分类
  deleteCategory: (id: number) =>
    http.delete<ApiResponse<Category>>(`/categories/${id}`),

  // 获取单个分类
  getCategory: (id: number) =>
    http.get<ApiResponse<Category>>(`/categories/${id}`),

  // 获取层级统计信息
  getLevelStats: () => {
    return http.get<ApiResponse<LevelStats>>('/api/categories/stats');
  },

  // 绑定教师到分类
  bindCategoryTeachers: (categoryId: number, data: { teacher_ids: number[] }) =>
    http.post<ApiResponse<null>>(`/categories/${categoryId}/teachers`, data),

  // 获取分类下的教师列表
  getCategoryTeachers: (categoryId: number) =>
    http.get<ApiResponse<Teacher[]>>(`/categories/${categoryId}/teachers`),
}; 