import { ApiResponse, http } from '../utils/request';

export enum ResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export enum ResourceName {
  BANNER = 'banner',
  STICKER = 'sticker'
}

export enum ResourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Resource {
  id: number;
  path: string;
  type: ResourceType;
  name: ResourceName;
  description: string;
  status: ResourceStatus;
  created_at: string;
}

interface ResourceListResponse {
  total: number;
  items: Resource[];
}

interface BannerResponse {
  id: number;
  url: string;
  title: string;
  description: string;
}

export interface ResourceListParams {
  page: number;
  size: number;
  resource_type?: string;
  resource_name?: string;
  status?: string;
}

export interface ResourceUpdate {
  description?: string;
  status?: string;
  name?: string;
}

export const resourcesApi = {
  // 获取资源列表
  getResources: (params: ResourceListParams) =>
    http.get<ApiResponse<ResourceListResponse>>('/resources/list', { params }),

  // 更新资源状态
  updateResource: (resourceId: number, data: ResourceUpdate) =>
    http.put<ApiResponse<null>>(`/resources/${resourceId}`, data),

  // 删除资源
  deleteResource: (resourceId: number) =>
    http.delete<ApiResponse<null>>(`/resources/${resourceId}`),

  // 上传文件
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<ApiResponse<{ url: string; path: string }>>('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 删除文件
  deleteFile: (url: string) =>
    http.post<ApiResponse<null>>('/upload/delete', { url }),

  // 添加轮播图 - 注意这里参数格式改变
  addBanner: (data: { url: string; description: string }) =>
    http.post<ApiResponse<BannerResponse>>('/resources/banner', data),
}; 