import { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { aiApi, AIStatistics } from '../../../api/ai';

const Consumption: React.FC = () => {
  const [statistics, setStatistics] = useState<AIStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await aiApi.getStatistics({ days: 7 });
      if (res.code === 0 && res.data) {
        setStatistics(res.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <Card loading={loading}>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic title="总回复数" value={statistics?.total_replies || 0} />
        </Col>
        <Col span={6}>
          <Statistic 
            title="成功率" 
            value={statistics?.success_rate || 0} 
            suffix="%" 
            precision={2}
          />
        </Col>
        {/* ... 其他统计数据 ... */}
      </Row>
    </Card>
  );
};

export default Consumption;
