import { Card, DatePicker, Row, Col, Statistic, message } from 'antd';
import { useState, useEffect } from 'react';
import { analyticsApi, UserActions } from '../../api/analytics';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';

const { RangePicker } = DatePicker;

const UserActionsPage = () => {
  const [loading, setLoading] = useState(false);
  const [actionData, setActionData] = useState<UserActions[]>([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.getUserActions({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      });
      console.log(result);
      if (result.code === 0 && result.data?.items) {
        setActionData(result.data.items);
      } else {
        console.error('数据格式错误:', result);
        message.error('获取数据失败');
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // 计算总数
  const getTotalCount = (type: keyof Omit<UserActions, 'date'>) => {
    if (!actionData?.length) return 0;
    return actionData.reduce((sum, item) => sum + (item[type] || 0), 0);
  };

  // 获取 ECharts 配置
  const getEChartsOption = () => {
    if (!actionData?.length) {
      return {
        title: {
          text: '暂无数据',
          left: 'center'
        }
      };
    }

    const dates = actionData.map(item => item.date);
    const postsData = actionData.map(item => item.posts || 0);
    const commentsData = actionData.map(item => item.comments || 0);
    const likesData = actionData.map(item => item.likes || 0);
    const favoritesData = actionData.map(item => item.favorites || 0);

    return {
      title: {
        text: '用户行为趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['发帖数', '评论数', '点赞数', '收藏数'],
        top: '30px'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '发帖数',
          type: 'line',
          data: postsData,
          smooth: true,
          itemStyle: {
            color: '#3C8772'
          }
        },
        {
          name: '评论数',
          type: 'line',
          data: commentsData,
          smooth: true,
          itemStyle: {
            color: '#1E90FF'
          }
        },
        {
          name: '点赞数',
          type: 'line',
          data: likesData,
          smooth: true,
          itemStyle: {
            color: '#FFA500'
          }
        },
        {
          name: '收藏数',
          type: 'line',
          data: favoritesData,
          smooth: true,
          itemStyle: {
            color: '#FF69B4'
          }
        }
      ]
    };
  };

  return (
    <Card
    title="用户行为分析"
    extra={
      <RangePicker
        value={dateRange}
        onChange={(dates) => dates && setDateRange(dates)}
      />
    }
  >
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card>
          <Statistic
            title="总发帖数"
            value={getTotalCount('posts')}
            loading={loading}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="总评论数"
            value={getTotalCount('comments')}
            loading={loading}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="总点赞数"
            value={getTotalCount('likes')}
            loading={loading}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="总收藏数"
            value={getTotalCount('favorites')}
            loading={loading}
          />
        </Card>
      </Col>
    </Row>

    <div style={{ marginTop: 24 }}>
      <Card title="用户行为趋势">
        <ReactECharts
          option={getEChartsOption()}
          style={{ height: 400 }}
          loading={loading}
        />
      </Card>
    </div>
  </Card>
  );
};

export default UserActionsPage;