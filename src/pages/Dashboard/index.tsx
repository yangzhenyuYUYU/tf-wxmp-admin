import { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, List, Typography, Tag, Avatar, Statistic, Space } from 'antd';
import * as echarts from 'echarts';
import { 
  UserOutlined, 
  FileTextOutlined, 
  EyeOutlined, 
  MessageOutlined, 
  LikeOutlined,
  RobotOutlined,
  BookOutlined,
  NotificationOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, DashboardOverview, ActiveUser, HotPost } from '../../api/dashboard';
import { analyticsApi, UserActions } from '../../api/analytics';
import { adminApi, AdminInfo } from '../../api/admin';
import { announcementApi, Announcement } from '../../api/announcement';
import styles from './index.module.less';

const Dashboard = () => {
  const navigate = useNavigate();
  const userActionChartRef = useRef<HTMLDivElement>(null);
  const userActionChart = useRef<echarts.ECharts>();

  const [loading, setLoading] = useState({
    overview: false,
    activeUsers: false,
    hotPosts: false,
    aiStats: false,
    userActions: false
  });

  // 状态管理
  const [overview, setOverview] = useState<DashboardOverview>();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [hotPosts, setHotPosts] = useState<HotPost[]>([]);
  const [userActions, setUserActions] = useState<UserActions[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [admins, setAdmins] = useState<AdminInfo[]>([]);

  // 核心数据卡片配置
  const coreStats = [
    {
      title: '用户数据',
      icon: <TeamOutlined className={styles.statIcon} />,
      path: '/users',
      stats: [
        { 
          title: '总用户数', 
          value: overview?.total_users || 0,
          trend: overview?.user_growth || 0,
          suffix: '人'
        },
        { 
          title: '今日活跃', 
          value: overview?.active_users || 0,
          suffix: '人'
        }
      ]
    },
    {
      title: '内容数据',
      icon: <FileTextOutlined className={styles.statIcon} />,
      path: '/posts',
      stats: [
        { 
          title: '总帖子数', 
          value: overview?.total_posts || 0,
          trend: overview?.post_growth || 0,
          suffix: '篇'
        },
        { 
          title: '今日发布', 
          value: overview?.today_posts || 0,
          suffix: '篇'
        }
      ]
    },
    {
      title: 'AI助手',
      icon: <RobotOutlined className={styles.statIcon} />,
      path: '/ai-settings/models',
      stats: [
        { 
          title: 'AI回复总数', 
          value: overview?.total_ai_replies || 0,
          trend: overview?.ai_reply_growth || 0,
          suffix: '条'
        },
        { 
          title: '今日回复', 
          value: overview?.today_ai_replies || 0,
          suffix: '条'
        }
      ]
    },
    {
      title: '知识库',
      icon: <BookOutlined className={styles.statIcon} />,
      path: '/knowledge/materials',
      stats: [
        { 
          title: '知识条目', 
          value: overview?.knowledge_count || 0,
          trend: overview?.knowledge_growth || 0,
          suffix: '条'
        },
        { 
          title: '知识库数', 
          value: overview?.knowledge_base_count || 0,
          suffix: '个'
        }
      ]
    }
  ];

  // 初始化图表
  useEffect(() => {
    if (userActionChartRef.current) {
      userActionChart.current = echarts.init(userActionChartRef.current);
    }

    const handleResize = () => {
      userActionChart.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      userActionChart.current?.dispose();
    };
  }, []);

  // 更新用户行为图表
  useEffect(() => {
    if (userActionChart.current && userActions?.length > 0) {
      const option: echarts.EChartOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['发帖', '评论', '点赞', '收藏'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: userActions.map(item => item.date),
          axisLabel: { rotate: 30 }
        },
        yAxis: {
          type: 'value',
          name: '数量'
        },
        series: [
          {
            name: '发帖',
            type: 'bar',
            stack: 'total',
            data: userActions.map(item => item.posts),
            itemStyle: { color: '#1890ff' }
          },
          {
            name: '评论',
            type: 'bar',
            stack: 'total',
            data: userActions.map(item => item.comments),
            itemStyle: { color: '#52c41a' }
          },
          {
            name: '点赞',
            type: 'bar',
            stack: 'total',
            data: userActions.map(item => item.likes),
            itemStyle: { color: '#faad14' }
          },
          {
            name: '收藏',
            type: 'bar',
            stack: 'total',
            data: userActions.map(item => item.favorites),
            itemStyle: { color: '#eb2f96' }
          }
        ]
      };

      userActionChart.current?.setOption(option);
    }
  }, [userActions]);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading({ ...loading, overview: true });
      try {
        const [overviewRes, activeUsersRes, hotPostsRes, userActionsRes] = await Promise.all([
          dashboardApi.getOverview(),
          dashboardApi.getActiveUsers({ page: 1, size: 5 }),
          dashboardApi.getHotPosts({ page: 1, size: 5 }),
          analyticsApi.getUserActions({
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          })
        ]);

        if (overviewRes.code === 0) setOverview(overviewRes.data);
        if (activeUsersRes.code === 0) setActiveUsers(activeUsersRes.data.list);
        if (hotPostsRes.code === 0) setHotPosts(hotPostsRes.data.list);
        if (userActionsRes?.code === 0) setUserActions(userActionsRes.data.items);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading({ ...loading, overview: false });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, adminsRes] = await Promise.all([
          announcementApi.getAnnouncements({ page: 1, size: 5 }),
          adminApi.getAdmins({ page: 1, size: 5 })
        ]);

        if (announcementsRes.code === 0) setAnnouncements(announcementsRes.data.items);
        if (adminsRes.code === 0) setAdmins(adminsRes.data.items);
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.dashboard}>
      {/* 核心数据概览 - 改为横向排列且添加分割线 */}
      <Row gutter={[12, 12]} className={styles.statsRow}>
        {coreStats.map((item, index) => (
          <Col xs={12} sm={12} md={6} key={index}>
            <Card 
              hoverable 
              className={styles.statCard}
              onClick={() => navigate(item.path)}
              bodyStyle={{ padding: '12px' }}
            >
              <div className={styles.cardHeader}>
                {item.icon}
                <h3>{item.title}</h3>
              </div>
              <Row gutter={12} className={styles.statsContent}>
                {item.stats.map((stat, idx) => (
                  <Col span={12} key={idx} className={styles.statCol}>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.trend ? (
                        <Tag color={stat.trend > 0 ? 'success' : 'error'} className={styles.trend}>
                          {stat.trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                          {Math.abs(stat.trend)}%
                        </Tag>
                      ) : null}
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 第二行：用户行为分析 + 活跃用户和热门内容 */}
      <Row gutter={[12, 12]} className={styles.contentRow}>
        <Col span={14}>
          <Card 
            title="用户行为趋势" 
            extra={<a onClick={() => navigate('/user-actions')}>详情</a>}
            bodyStyle={{ padding: '12px' }}
          >
            <div ref={userActionChartRef} style={{ height: 260 }} />
            <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Card 
                  title={<><NotificationOutlined /> 最新公告</>}
                  extra={<a onClick={() => navigate('/announcements')}>更多</a>}
                  bodyStyle={{ padding: '8px 12px' }}
                >
                  <List
                    size="small"
                    dataSource={announcements}
                    renderItem={(item) => (
                      <List.Item className={styles.announcementItem}>
                        <Typography.Text ellipsis className={styles.title}>
                          {item.title}
                        </Typography.Text>
                        <span className={styles.date}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  title={<><TeamOutlined /> 管理员概况</>}
                  extra={<a onClick={() => navigate('/admin')}>更多</a>}
                  bodyStyle={{ padding: '8px 12px' }}
                >
                  <List
                    size="small"
                    dataSource={admins}
                    renderItem={(admin) => (
                      <List.Item className={styles.adminItem}>
                        <Space style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar size="small" icon={<UserOutlined />} />
                          <span className={styles.username}>{admin.username}</span>
                        </Space>
                        <Tag color={admin.role === 'super_admin' ? 'green' : 'blue'}>
                          {admin.role === 'super_admin' ? '超级管理员' : '管理员'}
                        </Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={10}>
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <Card 
                title="活跃用户" 
                extra={<a onClick={() => navigate('/users')}>更多</a>}
                bodyStyle={{ padding: '8px 12px' }}
              >
                <List
                  size="small"
                  dataSource={activeUsers.slice(0, 5)}
                  renderItem={(user, index) => (
                    <List.Item className={styles.userItem}>
                      <span className={styles.rank} style={{
                        backgroundColor: index < 3 ? ['#fa8c16', '#389e0d', '#135200'][index] : '#8c8c8c'
                      }}>{index + 1}</span>
                      <span className={styles.nickname}>{user.nickname}</span>
                      <span className={styles.count}>{user.action_count}</span>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card 
                title="热门内容" 
                extra={<a onClick={() => navigate('/posts')}>更多</a>}
                bodyStyle={{ padding: '8px 12px' }}
              >
                <List
                  size="small"
                  dataSource={hotPosts.slice(0, 5)}
                  renderItem={(post, index) => (
                    <List.Item className={styles.postItem}>
                      <span className={styles.rank} style={{
                        backgroundColor: index < 3 ? ['#fa8c16', '#389e0d', '#135200'][index] : '#8c8c8c'
                      }}>{index + 1}</span>
                      <div className={styles.postContent}>
                        <Typography.Text ellipsis className={styles.title}>
                          {post.content || '无标题'}
                        </Typography.Text>
                        <div className={styles.postMeta}>
                          <span className={styles.author}>{post.author.nickname}</span>
                          <div className={styles.postStats}>
                            <span><EyeOutlined style={{ marginRight: 4 }} /> {post.view_count}</span>
                            <span><MessageOutlined style={{ marginRight: 4 }} /> {post.comment_count}</span>
                            <span><LikeOutlined style={{ marginRight: 4 }} /> {post.like_count}</span>
                            <span><StarOutlined style={{ marginRight: 4 }} /> {post.favorite_count}</span>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;