import { ApiResponse, http } from '../utils/request';

// 接口定义
export interface Material {
  id: string;
  name: string;
  knowledge_base_name: string;
  file_type: string;
  slice_count: number | string;
  process_status: string;
  create_time: string;
}

export interface MaterialListParams {
  page: number;
  size: number;
  knowledge_base_name?: string;
  file_type?: string;
  name?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  cover_url: string;
  materials_count: number;
  create_time: string;
  update_time: string;
  search_type: 'vector' | 'text';
  max_responses: number;
  match_rate: number;
  max_matches: number;
  chunk_threshold: number;
  enable_ocr: boolean;
  is_public: boolean;
  filter_sensitive: boolean;
  empty_prompt: string;
  welcome_prompt: string;
  system_kb_id: string;
}

interface KnowledgeBaseListResponse {
  total: number;
  items: KnowledgeBase[];
  page: number;
  size: number;
}

export interface KnowledgeBaseCreateParams {
  name: string;
  cover_url: string;
  embedding_model: string;
  welcome_prompt: string;
}

export interface KnowledgeBaseUpdateParams {
  name?: string;
  cover_url?: string;
}

export interface KnowledgeBaseSettings {
  search_type: 'vector' | 'text';
  max_responses: number;
  match_rate: number;
  max_matches: number;
  chunk_threshold: number;
  enable_ocr: boolean;
  is_public: boolean;
  filter_sensitive: boolean;
  empty_prompt: string;
}

// 更新知识库接口的类型定义
export interface KnowledgeBaseDetail {
  id: string;
  name: string;
  collectionName: string;
  avatarUrl: string;
  description: string;
  units: string;
  fileSize: string;
  multiRound: number;         // 会话轮数
  score: number;              // 匹配率
  topK: number;              // 匹配峰值
  fragmentSize: number;       // 分片大小
  sortOrder: number;
  emptyDesc: string;         // 空提示
  sensitiveFlag: string;     // 敏感词过滤开关
  sensitiveMsg: string;      // 敏感词提示
  welcomeMsg: string;        // 欢迎语
  publicFlag: string;        // 是否公开
  publicPassword: string | null; // 访问密码
  standardFlag: string;
  preSummary: string;
  preCompress: string;
  aiOcrFlag: string;         // OCR开关
  embeddingModel: string;    // 向量模型
  summaryModel: string;      // 摘要模型
  footer: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  delFlag: string;
}

// 文档切片列表参数接口
export interface SliceListParams {
  kb_id: string;
  page: number;
  size: number;
  name?: string;
  descs?: string;
  ascs?: string;
  slice_status?: number;
}

// 文档切片接口
export interface Slice {
  id: string;
  name: string;
  content: string;
  hitCount: string;
  charCount: string;
  sliceStatus: string;
  documentId: string;
  createTime: string;
}


// 资料接口
export interface UploadMaterialParams {
  local_kb_id: string;
  id: string;
  file_url: string;
  url?: string;
  kb_url: string;
  kb_object_name: string;
  object_name: string;
  name: string;
  size: number;
  content_type: string;
  resource_type: string;
  resource_name: string;
  description?: string;
  path: string;
}


// API 方法定义
export const knowledgeApi = {
  // 获取知识库列表
  getKnowledgeBases: (params: { page: number; size: number }) =>
    http.get<ApiResponse<KnowledgeBaseListResponse>>('/knowledge', { params }),
    
  // 创建知识库
  createKnowledgeBase: (data: KnowledgeBaseCreateParams) =>
    http.post<ApiResponse<KnowledgeBase>>('/knowledge', data),
    
  // 更新知识库
  updateKnowledgeBase: (id: string, data: KnowledgeBaseUpdateParams) =>
    http.put<ApiResponse<KnowledgeBase>>(`/knowledge/${id}`, data),
    
  // 删除知识库
  deleteKnowledgeBase: (id: string) =>
    http.delete<ApiResponse<null>>(`/knowledge/${id}`),

  // 获取知识库详情
  getKnowledgeBase: (id: string) =>
    http.get<ApiResponse<KnowledgeBaseDetail>>(`/knowledge/${id}`),

  // 获取资料列表
  getMaterials: (params: MaterialListParams) =>
    http.get<ApiResponse<{items: Material[], total: number}>>('/knowledge/materials', { params }),

  // 上传资料
  uploadMaterial: (kbId: string, file_params: UploadMaterialParams) => {
    return http.post<ApiResponse<Material>>(`/knowledge/${kbId}/materials`, file_params);
  },

  // 删除资料
  deleteMaterial: (kbId: string, materialId: string) =>
    http.post<ApiResponse<null>>(`/knowledge/delete_material`, {
      kb_id: kbId,
      material_id: materialId
    }),

  // 批量删除资料
  batchDeleteMaterials: (material_ids: string[]) =>
    http.delete<ApiResponse<null>>('/knowledge/materials/batch', {
      data: { material_ids }
    }),

  // 更新知识库设置
  updateKnowledgeBaseSettings: (kbId: string, settings: Partial<KnowledgeBaseSettings>) =>
    http.put<ApiResponse<KnowledgeBaseDetail>>(`/knowledge/${kbId}/settings`, settings),

  // 获取文档切片列表
  getSlices: (params: SliceListParams) =>
    http.post<ApiResponse<{records: Slice[], total: number}>>('/knowledge/get_slices', params),

  // 删除文档切片
  deleteSlice: (sliceId: string) =>
    http.post<ApiResponse<null>>(`/knowledge/delete_slices`, {
      slice_id: sliceId
    }),
}; 