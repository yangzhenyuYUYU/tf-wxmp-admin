import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { feedbackApi, Feedback } from '../../api/feedback';

const FeedbackPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);

  // 获取反馈列表
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await feedbackApi.getFeedbacks();
      if (res.data) {
        setFeedbacks(res.data.items);
        setTotal(res.data.total);
      }
    } catch (error) {
      message.error('获取反馈列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理状态更新
  const handleStatusUpdate = async (id: number, status: number) => {
    try {
      await feedbackApi.updateFeedbackStatus(id, status);
      message.success('状态更新成功');
      fetchFeedbacks();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条反馈吗？',
      onOk: async () => {
        try {
          await feedbackApi.deleteFeedback(id);
          message.success('删除成功');
          fetchFeedbacks();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<Feedback> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : status === 0 ? 'gold' : 'red'}>
          {status === 1 ? '已处理' : status === 0 ? '待处理' : '已关闭'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          {record.status === 0 && (
            <Button 
              type="link" 
              onClick={() => handleStatusUpdate(record.id, 1)}
            >
              标记已处理
            </Button>
          )}
          {record.status === 1 && (
            <Button 
              type="link" 
              onClick={() => handleStatusUpdate(record.id, 2)}
            >
              关闭反馈
            </Button>
          )}
          <Button 
            type="link" 
            danger 
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">反馈管理</h1>
      </div>
      
      <Table
        columns={columns}
        dataSource={feedbacks}
        rowKey="id"
        loading={loading}
        pagination={{
          total,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  );
};

export default FeedbackPage;