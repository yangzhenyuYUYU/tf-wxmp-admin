import { Table, Tag, Button, Space, Card, Form, Select, Input, message, Modal, Image, Descriptions, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import { RobotOutlined, SearchOutlined, DownOutlined, DeleteOutlined, EyeOutlined, PictureOutlined, UserOutlined, EditOutlined, StarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './index.module.less';
import { postApi, PostItem } from '../../api/post';
import { aiApi } from '../../api/ai';

const { Option } = Select;

const Posts = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [postDetail, setPostDetail] = useState<any>(null);
  const [editingAIReply, setEditingAIReply] = useState(false);
  const [aiReplyForm] = Form.useForm();

  // 获取帖子列表
  const fetchPosts = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const { code, data } = await postApi.getPosts({
        page,
        size,
        ...values,
      });
      
      if (code === 0 && data) {
        setPosts(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('获取帖子列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchPosts(1);
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setCurrentPage(1);
    fetchPosts(1);
  };

  // 修改设置精华的处理函数
  const handleExcellent = async (postId: number, isExcellent: boolean) => {
    try {
      const { code } = await postApi.setExcellent(postId, !isExcellent);
      if (code === 0) {
        message.success(`${isExcellent ? '取消' : '设为'}精华成功`);
        fetchPosts(); // 刷新列表
      }
    } catch (error) {
      console.error('设置精华失败:', error);
      message.error('操作失败');
    }
  };

  // 删除帖子
  const handleDelete = async () => {
    try {
      const { code } = await postApi.deletePost(postDetail.post.id);
      if (code === 0) {
        message.success('删除成功');
        setDetailVisible(false);
        fetchPosts(); // 刷新列表
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleViewDetail = async (post_id: number) => {
    try {
      setDetailLoading(true);
      const { code, data } = await postApi.getPostDetail(post_id);
      if (code === 0 && data) {
        setPostDetail(data);
        setDetailVisible(true);
      }
    } catch (error) {
      console.error('获取帖子详情失败:', error);
      message.error('获取详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 修改 AI 回复更新的处理函数
  const handleUpdateAIReply = async () => {
    try {
      const values = await aiReplyForm.validateFields();
      if (!postDetail?.ai_reply_info?.id) {
        message.error('AI回复ID不存在');
        return;
      }
      
      const { code } = await aiApi.updateReply(
        postDetail.ai_reply_info.id,
        values.reply_content
      );
      
      if (code === 0) {
        message.success('更新成功');
        setEditingAIReply(false);
        setDetailVisible(false);
        fetchPosts(); // 刷新列表
      }
    } catch (error) {
      console.error('更新AI回复失败:', error);
      message.error('更新失败');
    }
  };

  const columns: ColumnsType<PostItem> = [
    {
      title: 'ID',
      dataIndex: 'id', 
      width: 80,
    },
    {
      title: '问题内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '图片',
      dataIndex: 'images',
      width: 100,
      render: (images: string[]) => (
        images && images.length > 0 ? (
          <Tag color="blue" icon={<PictureOutlined />}>
            {images.length}张
          </Tag>
        ) : (
          <Tag color="default">无图片</Tag>
        )
      ),
    },
    {
      title: '分类',
      dataIndex: 'categories',
      width: 150,
      render: (categories: { id: number; name: string; key: string }[]) => (
        <Space>
          {categories.map(category => (
            <Tag key={category.id}>{category.name}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '作者',
      dataIndex: ['user', 'nickname'],
      ellipsis: true,
      width: 130,
    },
    {
      title: '品质',
      dataIndex: 'is_excellent',
      width: 80,
      render: (isExcellent: boolean) => (
        <Tag color={isExcellent ? 'gold' : 'default'}>
          {isExcellent ? '精华' : '普通'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleExcellent(record.id, record.is_excellent)}
          >
            {record.is_excellent ? '取消精华' : '设为精华'}
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete()}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  // Modal 中的精华按钮处理
  const handleModalExcellent = async () => {
    if (!postDetail) return;
    try {
      const { code } = await postApi.setExcellent(
        postDetail.post.id,
        !postDetail.post.is_excellent
      );
      if (code === 0) {
        message.success(`${postDetail.post.is_excellent ? '取消' : '设为'}精华成功`);
        setDetailVisible(false);
        fetchPosts(); // 刷新列表
      }
    } catch (error) {
      console.error('设置精华失败:', error);
      message.error('操作失败');
    }
  };

  return (
    <div className={styles.posts}>
      <Card bordered={false}>
        {/* 搜索表单 */}
        <Form
          form={form}
          layout="inline"
          className={styles.searchForm}
        >
          <Form.Item name="keyword">
            <Input
              placeholder="搜索标题或内容"
              prefix={<SearchOutlined />}
              allowClear
            />
          </Form.Item>
          <Form.Item name="is_excellent">
            <Select placeholder="精华状态" allowClear style={{ width: 120 }}>
              <Option value={true}>精华</Option>
              <Option value={false}>普通</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 帖子列表 */}
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
            expandedRowRender: (record) => (
              <div className={styles.expandedRow}>
                {/* 数据统计区域 */}
                <div className={styles.statsSection}>
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>浏览</span>
                      <span className={styles.statValue}>{record.view_count}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>点赞</span>
                      <span className={styles.statValue}>{record.like_count}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>评论</span>
                      <span className={styles.statValue}>{record.comment_count}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>收藏</span>
                      <span className={styles.statValue}>{record.favorite_count}</span>
                    </div>
                  </div>
                </div>

                {/* AI回复区域 */}
                <div className={styles.aiSection}>
                  {record.has_ai_reply ? (
                    <Space>
                      <Tag color="blue" icon={<RobotOutlined />}>
                        已回复 {record.ai_reply_count} 次
                      </Tag>
                      <Button 
                        type="link" 
                        onClick={() => handleViewDetail(record.id)}
                      >
                        查看AI回复详情
                      </Button>
                    </Space>
                  ) : (
                    <Tag>暂无AI回复</Tag>
                  )}
                </div>
              </div>
            ),
            expandIcon: ({ expanded, onExpand, record }) => (
              <DownOutlined
                rotate={expanded ? 180 : 0}
                onClick={e => onExpand(record, e)}
                className={styles.expandIcon}
              />
            ),
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              fetchPosts(page, size);
            },
          }}
        />
      </Card>

      <Modal
        title={
          postDetail ? (
            <div className={styles.modalTitle}>
              <div className={styles.userInfo}>
                <Avatar 
                  src={postDetail.post.user?.avatar} 
                  size={32}
                  icon={<UserOutlined />}
                />
                <div className={styles.userMeta}>
                  <div className={styles.userName}>
                    <span className={styles.nickname}>{postDetail.post.user?.nickname}</span>
                    {postDetail.post.user?.real_name && (
                      <span className={styles.realName}>({postDetail.post.user?.real_name})</span>
                    )}
                    {postDetail.post.user?.role && (
                      <Tag color="blue" className={styles.roleTag}>
                        {postDetail.post.user?.role}
                      </Tag>
                    )}
                  </div>
                  <div className={styles.postMeta}>
                    {postDetail.post.user?.nickname} 在 {dayjs(postDetail.post.created_at).format('YYYY年MM月DD日 HH:mm')} 
                    发布了一个{postDetail.post.categories?.map((cat: any) => cat.name).join('、')}相关的问题
                  </div>
                </div>
              </div>
            </div>
          ) : '帖子详情'
        }
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setEditingAIReply(false);
          aiReplyForm.resetFields();
        }}
        footer={
          <div className={styles.modalFooter}>
            <Space>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: '确认删除',
                    content: '确定要删除这个帖子吗？',
                    okText: '确定',
                    cancelText: '取消',
                    onOk: handleDelete
                  });
                }}
              >
                删除
              </Button>
              <Button
                type={postDetail?.post.is_excellent ? 'default' : 'primary'}
                icon={<StarOutlined />}
                onClick={handleModalExcellent}
              >
                {postDetail?.post.is_excellent ? '取消精华' : '设为精华'}
              </Button>
              {editingAIReply ? (
                <>
                  <Button onClick={() => {
                    setEditingAIReply(false);
                    aiReplyForm.resetFields();
                  }}>
                    取消编辑
                  </Button>
                  <Button type="primary" onClick={handleUpdateAIReply}>
                    保存回复
                  </Button>
                </>
              ) : (
                postDetail?.ai_reply_info && (
                  <Button 
                    type="link" 
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingAIReply(true);
                      aiReplyForm.setFieldsValue({
                        reply_content: postDetail.ai_reply_info.content
                      });
                    }}
                  >
                    编辑回复
                  </Button>
                )
              )}
            </Space>
          </div>
        }
        width={1000}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>
        ) : postDetail ? (
          <div className={styles.modalContent}>
            <div className={styles.modalLayout}>
              {/* 左侧表单区域 */}
              <div className={styles.leftSection}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="问题内容">
                    {postDetail.post.content}
                  </Descriptions.Item>
                  <Descriptions.Item label="数据统计">
                    <Space>
                      <Tag>浏览 {postDetail.post.view_count}</Tag>
                      <Tag>点赞 {postDetail.post.like_count}</Tag>
                      <Tag>评论 {postDetail.post.comment_count}</Tag>
                      <Tag>收藏 {postDetail.post.favorite_count}</Tag>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* 右侧图片和AI回复区域 */}
              <div className={styles.rightSection}>
                {/* 图片展示区 */}
                {postDetail.post.images && postDetail.post.images.length > 0 && (
                  <div className={styles.imageSection}>
                    <div className={styles.sectionTitle}>
                      <h4>图片展示</h4>
                    </div>
                    <div className={styles.imageGrid}>
                      <Image.PreviewGroup>
                        {postDetail.post.images.map((img: string, index: number) => (
                          <div key={index} className={styles.imageItem}>
                            <Image
                              src={img}
                              alt={`图片${index + 1}`}
                              preview={{
                                mask: '预览',
                                maskClassName: styles.previewMask
                              }}
                            />
                          </div>
                        ))}
                      </Image.PreviewGroup>
                    </div>
                  </div>
                )}

                {/* AI回复区域 */}
                {postDetail.ai_reply_info && (
                  <div className={styles.aiReplySection}>
                    <Card 
                      title={
                        <div className={styles.aiReplyTitle}>
                          <span>AI回复内容</span>
                          {!editingAIReply && (
                            <Button 
                              type="link" 
                              icon={<EditOutlined />}
                              onClick={() => {
                                setEditingAIReply(true);
                                aiReplyForm.setFieldsValue({
                                  reply_content: postDetail.ai_reply_info.content
                                });
                              }}
                            >
                              编辑
                            </Button>
                          )}
                        </div>
                      }
                      className={styles.aiReplyCard}
                      bordered={false}
                    >
                      {editingAIReply ? (
                        <Form form={aiReplyForm} layout="vertical">
                          <Form.Item 
                            name="reply_content"
                            rules={[{ required: true, message: '请输入回复内容' }]}
                          >
                            <Input.TextArea 
                              rows={10}
                              className={styles.aiReplyTextarea}
                            />
                          </Form.Item>
                        </Form>
                      ) : (
                        <>
                          <div className={styles.aiReplyContent}>
                            {postDetail.ai_reply_info.content}
                          </div>
                          <div className={styles.aiReplyMeta}>
                            <Tag color="blue">模型: {postDetail.ai_reply_info.model_type}</Tag>
                            <Tag color="green">评分: {postDetail.ai_reply_info.rating}</Tag>
                          </div>
                        </>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Posts;