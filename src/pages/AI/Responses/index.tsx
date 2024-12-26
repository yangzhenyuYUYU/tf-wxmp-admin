import React, { useState, useEffect } from 'react';
import { Table, Space, Button, DatePicker, Select, Form, message, Tag, Card, TableProps, Modal, Input } from 'antd';
import { aiApi } from '../../../api/ai';
import type { AIResponse } from '../../../api/ai';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

// AI回复状态映射
const statusMap = {
  pending: { text: '等待处理', color: 'default' },
  processing: { text: '处理中', color: 'processing' },
  completed: { text: '已完成', color: 'success' },
  failed: { text: '失败', color: 'error' }
} as const;


const Responses: React.FC = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 定义状态和类型选项
  const statusOptions = [
    { label: '全部', value: '' },
    { label: '成功', value: 'completed' },
    { label: '失败', value: 'failed' },
    { label: '处理中', value: 'processing' }
  ];

  const modelTypeOptions = [
    { label: '全部', value: '' },
    { label: '聊天', value: 'chat' },
    { label: '向量', value: 'vector' },
    { label: '视觉', value: 'vision' },
    { label: '图片', value: 'image' }
  ];

  const handleEdit = (record: AIResponse) => {
    setCurrentResponse(record);
    editForm.setFieldsValue({
      reply_content: record.reply_content
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!currentResponse) return;
      const res = await aiApi.updateReply(currentResponse.id, values.reply_content);
      if (res.code === 0) {
        message.success('更新成功');
        setEditModalVisible(false);
        fetchResponses();
      } else {
        message.error(res.msg || '更新失败');
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  const columns = [
    {
      title: '帖子ID',
      dataIndex: 'post_id',
      key: 'post_id',
      width: 120,
      ellipsis: true,
    },
    {
      title: '解答内容',
      dataIndex: 'reply_content',
      key: 'reply_content',
      ellipsis: true,
    },
    {
      title: '模型类型',
      dataIndex: 'model_config',
      key: 'model_config',
      width: 150,
      render: (config: string) => {
        const option = modelTypeOptions.find(opt => opt.value === config);
        return option ? option.label : config;
      }
    },
    {
      title: '状态',
      dataIndex: 'status', 
      width: 120,
      key: 'status',
      render: (status: string) => {
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo?.color}>{statusInfo?.text || status}</Tag>;
      }
    },
    // {
    //   title: '处理时间',
    //   dataIndex: 'processing_time',
    //   key: 'processing_time',
    //   width: 100,
    //   render: (time: number) => `${time}ms`
    // },
    // {
    //   title: 'Token数',
    //   dataIndex: 'total_tokens',
    //   key: 'total_tokens',
    //   width: 100,
    // },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating: number) => rating ? `${rating}分` : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: AIResponse) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          编辑
        </Button>
      )
    }
  ];

  const fetchResponses = async (params: any = {}) => {
    try {
      setLoading(true);
      const res = await aiApi.getResponses({
        page: params.current || pagination.current,
        size: params.pageSize || pagination.pageSize,
        model_type: form.getFieldValue('model_type'),
        status: form.getFieldValue('status'),
        start_date: form.getFieldValue('dateRange')?.[0]?.format('YYYY-MM-DD'),
        end_date: form.getFieldValue('dateRange')?.[1]?.format('YYYY-MM-DD')
      });

      if (res.code === 0 && res.data) {
        setResponses(res.data.items);
        setPagination({
          ...pagination,
          current: params.current || pagination.current,
          pageSize: params.pageSize || pagination.pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.msg || '获取回复记录失败');
      }
    } catch (error) {
      message.error('获取回复记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange: TableProps<AIResponse>['onChange'] = (paginationParams) => {
    fetchResponses({
      current: paginationParams.current,
      pageSize: paginationParams.pageSize,
    });
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchResponses({ current: 1 });
  };

  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchResponses({ current: 1 });
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  return (
    <Card>
      <Form
        form={form}
        layout="inline"
        style={{ marginBottom: 24 }}
        onFinish={handleSearch}
      >
        <Form.Item name="dateRange" label="时间范围">
          <RangePicker />
        </Form.Item>
        <Form.Item name="model_type" label="模型类型">
          <Select
            style={{ width: 120 }}
            options={modelTypeOptions}
            placeholder="请选择类型"
          />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select
            style={{ width: 120 }}
            options={statusOptions}
            placeholder="请选择状态"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={responses}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title="编辑AI回复"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="reply_content"
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Responses;
