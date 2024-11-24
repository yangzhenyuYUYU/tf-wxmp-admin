// 学员类型
export interface Student {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

// 内容帖子类型
export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createTime: string;
  status: 'published' | 'draft';
}

// AI设置类型
export interface AISettings {
  id: number;
  modelName: string;
  temperature: number;
  maxTokens: number;
  isEnabled: boolean;
}

// 用户操作记录类型
export interface UserAction {
  id: number;
  userId: number;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
} 