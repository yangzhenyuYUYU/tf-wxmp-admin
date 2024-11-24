import { Table, Tag, Button, Space, Card, Form, Select, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import { RobotOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './index.module.less';
import { postApi, PostItem } from '../../api/post';

const { Option } = Select;

const Posts = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

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
      message.error('获取帖子列表失败');
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

  // 设置精华
  const handleSetExcellent = async (post_id: number, is_excellent: boolean) => {
    try {
      const { code } = await postApi.setExcellent(post_id, !is_excellent);
      if (code === 0) {
        message.success(`${!is_excellent ? '设为' : '取消'}精华成功`);
        fetchPosts();
      }
    } catch (error) {
      console.error('设置精华失败:', error);
      message.error('操作失败');
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
      width: 300,
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: ['user', 'nickname'],
      width: 120,
    },
    {
      title: '数据统计',
      width: 280,
      render: (_, record) => (
        <Space size="middle">
          <span>浏览 {record.view_count}</span>
          <span>点赞 {record.like_count}</span>
          <span>评论 {record.comment_count}</span>
          <span>收藏 {record.favorite_count}</span>
        </Space>
      ),
    },
    {
      title: 'AI回复',
      width: 100,
      render: (_, record) => (
        record.has_ai_reply && (
          <Tag color="blue" icon={<RobotOutlined />}>
            {record.ai_reply_count}
          </Tag>
        )
      ),
    },
    {
      title: '精华',
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
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link"
            onClick={() => handleSetExcellent(record.id, record.is_excellent)}
          >
            {record.is_excellent ? '取消精华' : '设为精华'}
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

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
    </div>
  );
};

export default Posts; 