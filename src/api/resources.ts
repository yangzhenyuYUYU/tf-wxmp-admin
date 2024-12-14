import { ApiResponse, http } from '../utils/request';

export enum ResourceType {
  IMAGE = 'image',    // 图片
  GIF = 'gif',       // 动图  
  VIDEO = 'video',   // 视频
  AUDIO = 'audio',   // 音频
  FILE = 'file'      // 其他文件
}

export enum ResourceName {
  BANNER = 'banner',      // 轮播图
  STICKER = 'sticker',   // 表情包
  NORMAL = 'normal',     // 普通资源
  KNOWLEDGE = 'knowledge' // 知识库
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

interface BannerListResponse {
  total: number;
  items: Resource[];
}

interface BannerResponse {
  id: number;
  url: string;
  title: string;
  description: string;
}

interface StickerListResponse {
  total: number;
  items: {
    id: number;
    path: string;
    description: string;
    status: string;
    created_at: string;
  }[];
}

interface StickerCreate {
  url: string;
  description: string;
  type: ResourceType;
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
    http.get<ApiResponse<ResourceListResponse>>('/resources/stickers', { params }),

  // 更新资源状态
  updateResource: (resourceId: number, data: ResourceUpdate) =>
    http.put<ApiResponse<null>>(`/resources/${resourceId}`, data),

  // 删除资源
  deleteResource: (resourceId: number) =>
    http.delete<ApiResponse<null>>(`/resources/${resourceId}`),

  // 上传文件
  uploadFile: (file: File, description: string = '', resource_type: ResourceType = ResourceType.IMAGE, resource_name: ResourceName = ResourceName.NORMAL) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    if (resource_type) {
      formData.append('resource_type', resource_type);
    }
    if (resource_name) {
      formData.append('resource_name', resource_name);
    }
    return http.post<ApiResponse<{
      id: string | number;
      kb_url: string | null;
      kb_object_name: string | null;
      object_name: string;
      url: string;
      filename: string;
      size: number;
      content_type: string;
      resource_type: string;
      resource_name: string;
      description: string | null;
      path: string;
    }>>('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 删除文件
  deleteFile: (url: string) =>
    http.post<ApiResponse<null>>('/upload/delete', { url }),
  
  // 获取轮播图列表
  getBanners: (params: { page: number; size: number }) =>
    http.get<ApiResponse<BannerListResponse>>('/resources/banners', { params }),

  // 添加轮播图
  addBanner: (data: { url: string; description: string }) =>
    http.post<ApiResponse<BannerResponse>>('/resources/banner', data),

  // 获取表情包列表
  getStickers: (params: { page: number; size: number; status?: string }) =>
    http.get<ApiResponse<StickerListResponse>>('/resources/stickers', { params }),

  // 添加表情包
  addSticker: (data: StickerCreate) =>
    http.post<ApiResponse<{ id: number; url: string; description: string, type: ResourceType }>>('/resources/sticker', data),
};