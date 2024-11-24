import { http } from '../utils/request';

const API_PREFIX = '/categories';

export interface Category {
  categoryId: string;
  name: string;
  description: string;
  sort: number;
  createTime: string;
}

export interface CreateCategoryParams {
  name: string;
  description: string;
  sort?: number;
}

export const categoryApi = {
  getCategories: () => 
    http.get<Category[]>(`${API_PREFIX}/list`),
    
  createCategory: (data: CreateCategoryParams) =>
    http.post<Category>(API_PREFIX, data),
    
  updateCategory: (categoryId: string, data: Partial<CreateCategoryParams>) =>
    http.put(`${API_PREFIX}/${categoryId}`, data),
    
  deleteCategory: (categoryId: string) =>
    http.delete(`${API_PREFIX}/${categoryId}`),
}; 