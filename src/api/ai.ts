import { ApiResponse, http } from '../utils/request';

// 接口定义
export interface AIModel {
  id: string;
  name: string;
  modelName: string;
  modelType: string;
  provider: string;
  apiKey: string;
  baseUrl: string;
  secretKey?: string;
  endpoint?: string;
  azureDeploymentName?: string;
  geminiProject?: string;
  geminiLocation?: string;
  responseLimit?: number;
  temperature?: number;
  topP?: number;
  imageSize?: string;
  imageQuality?: string;
  imageStyle?: string;
  defaultModel?: boolean;
  extData?: any;
  isActive: boolean;
  createdAt: string;
}

// 基础模型参数接口
export interface BaseModelParams {
  modelType?: string;
  modelName?: string;
  provider?: string;
  name?: string;
  responseLimit?: number;
  temperature?: number;
  topP?: number;
  apiKey?: string;
  baseUrl?: string;
  secretKey?: string;
  endpoint?: string;
  azureDeploymentName?: string;
  geminiProject?: string;
  geminiLocation?: string;
  imageSize?: string;
  imageQuality?: string;
  imageStyle?: string;
  defaultModel?: boolean;
  extData?: any;
}

// 创建模型时所有字段都是必需的
export interface CreateModelParams extends Required<Pick<BaseModelParams, 
  'modelType' | 'modelName' | 'provider' | 'name' | 'apiKey' | 'baseUrl'
>> {
  // 继承其他可选字段
  responseLimit?: number;
  temperature?: number;
  topP?: number;
  secretKey?: string;
  endpoint?: string;
  azureDeploymentName?: string;
  geminiProject?: string;
  geminiLocation?: string;
  imageSize?: string;
  imageQuality?: string;
  imageStyle?: string;
  defaultModel?: boolean;
  extData?: any;
}

// 更新模型时所有字段都是可选的
export interface UpdateModelParams extends BaseModelParams {}

export interface AIResponse {
  id: string;
  post_title: string;
  prompt: string;
  model_config: string;
  model_type: string;
  status: string;
  processing_time: number;
  total_tokens: number;
  rating: number;
  created_at: string;
  reply_content: string;
}

export interface ListResponse<T> {
  total: number;
  records: T[];
  page: number;
  size: number;
}

export interface AIStatistics {
  total_replies: number;
  success_rate: number;
  avg_rating: number;
  model_stats: Record<string, number>;
}

// API 方法定义
export const aiApi = {
  // 模型管理
  getModels: (params: { 
    page: number; 
    size: number;
    modelType?: string;
    descs?: string;
    ascs?: string;
  }) =>
    http.get<ApiResponse<ListResponse<AIModel>>>('/ai/models', { params }),

  createModel: (data: CreateModelParams) =>
    http.post<ApiResponse<{ id: string }>>('/ai/model', {
      model_type: data.modelType,
      model_name: data.modelName,
      provider: data.provider,
      name: data.name,
      response_limit: data.responseLimit,
      temperature: data.temperature,
      top_p: data.topP,
      api_key: data.apiKey,
      base_url: data.baseUrl,
      secret_key: data.secretKey,
      endpoint: data.endpoint,
      azure_deployment_name: data.azureDeploymentName,
      gemini_project: data.geminiProject,
      gemini_location: data.geminiLocation,
      image_size: data.imageSize,
      image_quality: data.imageQuality,
      image_style: data.imageStyle,
      default_model: data.defaultModel,
      ext_data: data.extData
    }),

  updateModel: (id: string, data: UpdateModelParams) =>
    http.put<ApiResponse<null>>(`/ai/models/${id}`, {
      model_type: data.modelType,
      model_name: data.modelName,
      provider: data.provider,
      name: data.name,
      response_limit: data.responseLimit,
      temperature: data.temperature,
      top_p: data.topP,
      api_key: data.apiKey,
      base_url: data.baseUrl,
      secret_key: data.secretKey,
      endpoint: data.endpoint,
      azure_deployment_name: data.azureDeploymentName,
      gemini_project: data.geminiProject,
      gemini_location: data.geminiLocation,
      image_size: data.imageSize,
      image_quality: data.imageQuality,
      image_style: data.imageStyle,
      default_model: data.defaultModel,
      ext_data: data.extData
    }),

  deleteModel: (id: string) =>
    http.delete<ApiResponse<null>>(`/ai/models/${id}`),

  // 回复记录
  getResponses: (params: {
    page: number;
    size: number;
    model_type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) =>
    http.get<ApiResponse<{items: AIResponse[], total: number}>>('/ai/records', { params }),

  // 更新回复内容
  updateReply: (id: string, reply_content: string) =>
    http.put<ApiResponse<null>>(`/ai/reply/${id}`, { reply_content }),

  // 统计数据
  getStatistics: (params: { days: number }) =>
    http.get<ApiResponse<AIStatistics>>('/ai/statistics', { params }),

  // 获取OCR配置
  getOCRConfig: () =>
    http.get<ApiResponse<{
      provider: string; // OCR服务提供商,如 aliyun
      modelName: string; // 模型名称,如 ocr-general 
      baseUrl: string; // API基础URL
      apiKey: string; // API密钥
      secretKey: string; // 密钥
      region?: string; // 地区
      extData?: Record<string, any>; // 扩展数据
    }>>('/ai/ocr/config'),

  // 更新OCR配置
  updateOCRConfig: (data: {
    provider: string;
    modelName: string;
    baseUrl: string;
    apiKey: string;
    secretKey: string;
    region?: string;
    extData?: any;
  }) =>
    http.put<ApiResponse<null>>('/ai/ocr/config', data),
};