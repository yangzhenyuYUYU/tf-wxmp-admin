import { useState, useEffect } from 'react';
import { Table, Select, Card } from 'antd';
import type { TableProps } from 'antd';
import { teacherApi } from '../../api/teacher';

const { Option } = Select;

interface TeacherData {
  id: string;
  username: string;
  categories: string[];
  last_login_time: string;
  response_rate: {
    month1: number;
    month3: number;
    year1: number;
  };
  avg_wait_time: {
    month1: number;
    month3: number;
    year1: number;
  };
}

const TeacherList = () => {
  const [timeRange, setTimeRange] = useState<'month1' | 'month3' | 'year1'>('month1');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TeacherData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await teacherApi.getTeacherList({
          page,
          size: pageSize
        });
        setData(response.data.items);
        setTotal(response.data.total);
      } catch (error) {
        console.error('获取教师列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize]);

  const columns: TableProps<TeacherData>['columns'] = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '绑定类别',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: string[]) => categories.join('、')
    },
    {
      title: '最近登录时间',
      dataIndex: 'last_login_time',
      key: 'last_login_time',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '回答率',
      dataIndex: 'response_rate',
      key: 'response_rate',
      render: (rates) => `${(rates[timeRange]).toFixed(2)}%`,
    },
    {
      title: '平均等待时间',
      dataIndex: 'avg_wait_time',
      key: 'avg_wait_time',
      render: (times) => `${Math.floor(times[timeRange] / 60)}分钟`,
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>时间范围：</span>
        <Select 
          value={timeRange} 
          onChange={setTimeRange}
          style={{ width: 120 }}
        >
          <Option value="month1">近一个月</Option>
          <Option value="month3">近三个月</Option>
          <Option value="year1">近一年</Option>
        </Select>
      </div>
      
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }
        }}
      />
    </Card>
  );
};

export default TeacherList;