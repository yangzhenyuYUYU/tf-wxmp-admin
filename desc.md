我帮你整理一个管理后台的 API 接口文档表格：
管理后台 API 接口文档
| 模块 | 接口 | 方法 | 描述 | 权限 |
|-----|------|-----|------|-----|
| 控制台 |
| | /admin/dashboard/overview | GET | 获取总览数据（用户数、帖子数等） | admin |
| | /admin/dashboard/active-users | GET | 获取活跃用户排行 | admin |
| | /admin/dashboard/hot-posts | GET | 获取热门帖子排行 | admin |
| 用户管理 |
| | /admin/users/list | GET | 获取用户列表（支持分页、筛选） | admin |
| | /admin/users/{user_id} | PUT | 更新用户信息（角色、状态等） | admin |
| 内容管理 |
| | /admin/posts/list | GET | 获取帖子列表（支持分页、筛选） | admin |
| | /admin/posts/{post_id}/excellent | PUT | 设置精华帖子 | admin |
| 分类管理 |
| | /admin/categories/list | GET | 获取分类列表 | admin |
| | /admin/categories/ | POST | 创建分类 | admin |
| | /admin/categories/{category_id} | PUT | 更新分类 | admin |
| | /admin/categories/{category_id} | DELETE | 删除分类 | admin |
| 公告管理 |
| | /admin/announcements/list | GET | 获取公告列表（支持分页） | admin |
| | /admin/announcements/ | POST | 创建公告 | admin |
| | /admin/announcements/{notice_id} | PUT | 更新公告 | admin |
| | /admin/announcements/{notice_id} | DELETE | 删除公告 | admin |
| AI管理 |
| | /admin/ai/statistics | GET | 获取AI使用统计数据 | admin |
| | /admin/ai/records | GET | 获取AI回复记录（支持分页、筛选） | admin |
| 数据分析 |
| | /admin/analytics/user-growth | GET | 获取用户增长趋势 | admin |
| | /admin/analytics/user-actions | GET | 获取用户行为统计 | admin |
| | /admin/analytics/content-stats | GET | 获取内容统计数据 | admin |
| | /admin/analytics/monthly-stats | GET | 获取月度统计数据 | admin |
通用说明
认证方式：
所有接口需要在 Header 中携带 JWT Token
必须具有 admin 角色权限
分页参数：
page: 页码（默认1）
size: 每页数量（默认10）
响应格式：
{
    "code": 0,
    "msg": "success",
    "data": {
        // 具体数据
    }
}
错误码：
401: 未认证
403: 无权限
404: 资源不存在
400: 请求参数错误
时间格式：
所有时间字段使用 ISO 8601 格式
例如：2024-01-01T12:00:00Z
这些接口已经覆盖了管理后台的主要功能，包括：
数据统计和分析
用户管理
内容管理
分类管理
公告管理
AI功能管理