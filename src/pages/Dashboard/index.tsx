import { useEffect, useState } from 'react';
import { Card, Row, Col, List, Typography, Tag, Tooltip } from 'antd';
import { UserOutlined, FileTextOutlined, EyeOutlined, MessageOutlined, LikeOutlined, StarOutlined, CrownOutlined } from '@ant-design/icons';
import { dashboardApi } from '../../api/dashboard';
import type { DashboardOverview, ActiveUser, HotPost } from '../../api/dashboard';
import styles from './index.module.less';  // CSS Modules 方式
import dayjs from 'dayjs';

const { Title } = Typography;

const Dashboard = () => {
  const [overview, setOverview] = useState<DashboardOverview>();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [hotPosts, setHotPosts] = useState<HotPost[]>([]);
  const [loading, setLoading] = useState({
    overview: false,
    users: false,
    posts: false
  });

  // 获取总览数据
  const fetchOverview = async () => {
    try {
      setLoading(prev => ({ ...prev, overview: true }));
      const { code, data } = await dashboardApi.getOverview();
      if (code === 0 && data) {
        setOverview(data);
      }
    } catch (error) {
      console.error('获取总览数据失败:', error);
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  };

  // 获取活跃用户数据
  const fetchActiveUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const { code, data } = await dashboardApi.getActiveUsers({ page: 1, size: 10 });
      if (code === 0 && data?.list) {
        setActiveUsers(data.list);
      }
    } catch (error) {
      console.error('获取活跃用户数据失败:', error);
      setActiveUsers([]);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // 获取热门帖子数据
  const fetchHotPosts = async () => {
    try {
      setLoading(prev => ({ ...prev, posts: true }));
      const { code, data } = await dashboardApi.getHotPosts({ page: 1, size: 10 });
      if (code === 0 && data?.list) {
        setHotPosts(data.list);
      }
    } catch (error) {
      console.error('获取热门帖子数据失败:', error);
      setHotPosts([]);
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchActiveUsers();
    fetchHotPosts();
  }, []);

  return (
    <div className={styles.dashboard}>
      <Title level={4}>控制台</Title>
      
      {/* 数据概览卡片 */}
      <Row gutter={[16, 16]} className={styles.overviewCards}>
        <Col span={6}>
          <Card loading={loading.overview}>
            <div className={styles.statItem}>
              <UserOutlined className={styles.icon} />
              <div className={styles.content}>
                <div className={styles.title}>总用户数</div>
                <div className={styles.number}>{overview?.total_users}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading.overview}>
            <div className={styles.statItem}>
              <FileTextOutlined className={styles.icon} />
              <div className={styles.content}>
                <div className={styles.title}>总帖子数</div>
                <div className={styles.number}>{overview?.total_posts}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading.overview}>
            <div className={styles.statItem}>
              <UserOutlined className={styles.icon} />
              <div className={styles.content}>
                <div className={styles.title}>今日新增用户</div>
                <div className={styles.number}>{overview?.new_users}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading.overview}>
            <div className={styles.statItem}>
              <FileTextOutlined className={styles.icon} />
              <div className={styles.content}>
                <div className={styles.title}>今日新增帖子</div>
                <div className={styles.number}>{overview?.new_posts}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 活跃用户和热门帖子 */}
      <Row gutter={16} className="lists">
        <Col span={12}>
          <Card title="活跃用户排行" loading={loading.users}>
            <List
              dataSource={activeUsers}
              renderItem={(user, index) => (
                <List.Item>
                  <div className="user-item">
                    <span className="index">{index + 1}</span>
                    <span className="username">{user.nickname}</span>
                    <span className="count">{user.action_count} 次操作</span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="热门帖子排行" 
            loading={loading.posts}
            className={styles.hotPostCard}
          >
            <List
              dataSource={hotPosts}
              renderItem={(post, index) => (
                <List.Item className={styles.postItem}>
                  <div className={styles.postContent}>
                    <div className={styles.postHeader}>
                      <span className={styles.index} style={{ backgroundColor: index < 3 ? ['#f56a00', '#7cb305', '#13c2c2'][index] : '#8c8c8c' }}>
                        {index + 1}
                      </span>
                      <span className={styles.title}>
                        {post.is_excellent && (
                          <Tag color="#f50" className={styles.excellentTag}>
                            <CrownOutlined /> 精华
                          </Tag>
                        )}
                        {post.title}
                      </span>
                    </div>
                    
                    <div className={styles.postFooter}>
                      <span className={styles.author}>
                        {post.author.nickname}
                      </span>
                      <span className={styles.date}>
                        {dayjs(post.created_at).format('MM-DD HH:mm')}
                      </span>
                      <div className={styles.stats}>
                        <Tooltip title="浏览">
                          <span><EyeOutlined /> {post.view_count}</span>
                        </Tooltip>
                        <Tooltip title="点赞">
                          <span><LikeOutlined /> {post.like_count}</span>
                        </Tooltip>
                        <Tooltip title="评论">
                          <span><MessageOutlined /> {post.comment_count}</span>
                        </Tooltip>
                        <Tooltip title="收藏">
                          <span><StarOutlined /> {post.favorite_count}</span>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;