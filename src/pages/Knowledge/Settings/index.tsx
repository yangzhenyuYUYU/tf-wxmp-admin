import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, message, Space, Typography, Drawer, Row, Col, Spin, Empty, Pagination, Switch, Slider, Select } from 'antd';
import {EditOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { knowledgeApi } from '../../../api/knowledge';
import { aiApi } from '../../../api/ai';
import type { KnowledgeBase, KnowledgeBaseDetail } from '../../../api/knowledge';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [settingsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentKnowledgeBase, setCurrentKnowledgeBase] = useState<KnowledgeBase>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      fetchKnowledgeBase(idFromUrl);
      fetchSettings(idFromUrl);
      fetchModels();
    }
  }, []);

  const fetchKnowledgeBase = async (id: string) => {
    try {
      const res = await knowledgeApi.getKnowledgeBases({ page: 1, size: 1 });
      if (res.code === 0 && res.data.items.length > 0) {
        const kb = res.data.items[0];
        setCurrentKnowledgeBase(kb);
        setSelectedKnowledgeBase(id);
      }
    } catch (error) {
      message.error('获取知识库信息失败');
    }
  };

  const fetchModels = async () => {
    try {
      const res = await aiApi.getModels({ page: 1, size: 100, modelType: 'Embedding' });
      console.log(res,'res')
      if (res.code === 0) {
        setModels(res.data.records.map(model => ({ id: model.id, name: model.name })));
      }
    } catch (error) {
      message.error('获取模型列表失败' + error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchKnowledgeBases = async (page = pagination.current, size = pagination.pageSize) => {
    setLoading(true);
    try {
      const res = await knowledgeApi.getKnowledgeBases({ page, size });
      if (res.code === 0) {
        setKnowledgeBases(res.data.items);
        setPagination({
          ...pagination,
          current: res.data.page,
          total: res.data.total
        });
      }
    } catch (error) {
      message.error('获取知识库列表失败');
    }
    setLoading(false);
  };

  const fetchSettings = async (id: string) => {
    try {
      const res = await knowledgeApi.getKnowledgeBase(id);
      if (res.code === 0) {
        const settings = {
          welcomeMsg: res.data.welcomeMsg,
          embeddingModel: res.data.embeddingModel,
          multiRound: res.data.multiRound,
          score: res.data.score,
          topK: res.data.topK,
          fragmentSize: res.data.fragmentSize,
          aiOcrFlag: res.data.aiOcrFlag === '1',
          publicFlag: res.data.publicFlag === '1',
          sensitiveFlag: res.data.sensitiveFlag === '1',
          emptyDesc: res.data.emptyDesc,
          sensitiveMsg: res.data.sensitiveMsg,
          publicPassword: res.data.publicPassword || '',
        };
        settingsForm.setFieldsValue(settings);
      }
    } catch (error) {
      message.error('获取知识库设置失败');
    }
  };

  const handleSubmit = async (values: any) => {
    if (!selectedKnowledgeBase) return;
    
    try {
      const settings: Partial<KnowledgeBaseDetail> = {
        welcomeMsg: values.welcomeMsg,
        embeddingModel: values.embeddingModel,
        multiRound: values.multiRound,
        score: values.score,
        topK: values.topK,
        fragmentSize: values.fragmentSize,
        aiOcrFlag: values.aiOcrFlag ? '1' : '0',
        publicFlag: values.publicFlag ? '1' : '0',
        sensitiveFlag: values.sensitiveFlag ? '1' : '0',
        emptyDesc: values.emptyDesc,
        sensitiveMsg: values.sensitiveMsg,
        publicPassword: values.publicPassword,
      };

      const res = await knowledgeApi.updateKnowledgeBase(selectedKnowledgeBase, settings);
      if (res.code === 0) {
        message.success('设置已保存');
      } else {
        message.error(res.msg || '保存设置失败');
      }
    } catch (error) {
      message.error('保存设置失败');
    }
  };

  const handleSelectKnowledgeBase = (kb: KnowledgeBase) => {
    setCurrentKnowledgeBase(kb);
    setSelectedKnowledgeBase(kb.system_kb_id);
    fetchSettings(kb.system_kb_id);
    setDrawerVisible(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Space direction="horizontal" align="center" size={12}>
          <Title level={4} style={{ marginBottom: 0, marginTop: 0 }}>
            {currentKnowledgeBase ? currentKnowledgeBase.name : '请选择知识库'}
          </Title>
          {currentKnowledgeBase && (
            <Text type="secondary">ID: {currentKnowledgeBase.id}</Text>
          )}
        </Space>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => {
            setDrawerVisible(true);
            fetchKnowledgeBases();
          }}
        >
          选择知识库
        </Button>
      </div>

      <Form
        form={settingsForm}
        onFinish={handleSubmit}
        disabled={!selectedKnowledgeBase}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        style={{ maxWidth: 800 }}
      >
        <Form.Item name="embeddingModel" label="向量模型" style={{ marginBottom: 24 }}>
          <Select 
            placeholder="请选择向量模型"
            loading={loading}
            options={models?.map(model => ({
              label: model.name,
              value: model.id
            }))}
          />
        </Form.Item>
        <Form.Item name="welcomeMsg" label="欢迎语" style={{ marginBottom: 24 }}>
          <Input.TextArea rows={2} placeholder="请输入欢迎语" />
        </Form.Item>

        <Form.Item name="multiRound" label="会话轮数" style={{ marginBottom: 24 }}>
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item name="score" label="匹配率" style={{ marginBottom: 24 }}>
          <Slider
            min={0}
            max={100}
            tipFormatter={(value) => `${value}%`}
            marks={{
              0: '0%',
              100: '100%'
            }}
          />
        </Form.Item>

        <Form.Item name="topK" label="匹配峰值" style={{ marginBottom: 24 }}>
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item name="fragmentSize" label="分片大小" style={{ marginBottom: 24 }}>
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item 
          name="aiOcrFlag" 
          label="OCR识别"
          valuePropName="checked" 
          style={{ marginBottom: 24 }}
        >
          <Switch />
        </Form.Item>

        <Form.Item 
          name="publicFlag" 
          label="是否公开"
          valuePropName="checked" 
          style={{ marginBottom: 24 }}
        >
          <Switch />
        </Form.Item>

        <Form.Item 
          name="sensitiveFlag" 
          label="敏感词过滤"
          valuePropName="checked" 
          style={{ marginBottom: 24 }}
        >
          <Switch />
        </Form.Item>

        <Form.Item 
          name="sensitiveMsg" 
          label="敏感词提示"
          style={{ marginBottom: 24 }}
        >
          <Input.TextArea rows={2} placeholder="请输入敏感词提示语" />
        </Form.Item>

        <Form.Item 
          name="emptyDesc" 
          label="空提示"
          style={{ marginBottom: 24 }}
        >
          <Input.TextArea rows={2} placeholder="请输入未匹配时的提示内容" />
        </Form.Item>

        {/* <Form.Item 
          name="publicPassword" 
          label="访问密码"
          style={{ marginBottom: 24 }}
        >
          <Input.Password placeholder="请输入访问密码" />
        </Form.Item> */}

        <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
          <Button type="primary" htmlType="submit">
            保存设置
          </Button>
        </Form.Item>
      </Form>

      <Drawer
        title="选择知识库"
        placement="right"
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {loading ? (
          <Spin />
        ) : knowledgeBases.length === 0 ? (
          <Empty description="暂无知识库" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {knowledgeBases.map(kb => (
                <Col span={12} key={kb.id}>
                  <Card
                    hoverable
                    cover={kb.cover_url && <img alt={kb.name} src={kb.cover_url} style={{ height: 120, objectFit: 'cover' }} />}
                    style={{ 
                      cursor: 'pointer',
                      border: selectedKnowledgeBase === kb.id ? '2px solid #1890ff' : '1px solid #f0f0f0'
                    }}
                    onClick={() => handleSelectKnowledgeBase(kb)}
                  >
                    <Card.Meta
                      title={kb.name}
                      description={
                        <Space direction="vertical" size={4}>
                          <Text type="secondary">资料数量: {kb.materials_count}</Text>
                          <Text type="secondary">创建时间: {formatDate(kb.create_time)}</Text>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={(page) => fetchKnowledgeBases(page)}
                showTotal={(total) => `共 ${total} 条`}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Drawer>
    </Card>
  );
};

export default Settings;
