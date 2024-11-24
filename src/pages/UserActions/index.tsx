import { Table, DatePicker, Space, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import type { UserAction } from '@/types';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const UserActions = () => {
  const [actions, setActions] = useState<UserAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const columns = [
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
    },
  ];

  useEffect(() => {
    fetchActions();
  }, [dateRange]);

  const fetchActions = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch('/api/user-actions');
      const data = await response.json();
      setActions(data);
    } catch (error) {
      message.error('获取操作记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates ? [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] : null);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <RangePicker onChange={handleDateRangeChange} />
          <Button type="primary" icon={<SearchOutlined />}>
            搜索
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={actions}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default UserActions;