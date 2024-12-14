import React, { useState, useEffect } from 'react';
import { Card, Badge, Typography, Button, Pagination, Space, Popconfirm, Form, Input, Select, Radio } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { knowledgeApi } from '../../../api/knowledge';
import type { KnowledgeBase, Slice } from '../../../api/knowledge';

const { Text } = Typography;

const Slices: React.FC = () => {
  const [slices, setSlices] = useState<Slice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);
  const pageSize = 6;

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    try {
      const res = await knowledgeApi.getKnowledgeBases({ page: 1, size: 100 });
      if (res.code === 0) {
        setKnowledgeBases(res.data.items || []);
      }
    } catch (err) {
      console.error('获取知识库列表失败:', err);
      setKnowledgeBases([]);
    }
  };

  const fetchSlices = async (page: number) => {
    try {
      const values = form.getFieldsValue();
      const res = await knowledgeApi.getSlices({
        kb_id: values.knowledgeBaseId,
        page,
        size: pageSize,
        name: values.fileName,
        slice_status: trainStatus ? Number(trainStatus) : undefined
      });
      setSlices(res.data?.records || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error('获取切片列表失败:', err);  
      setSlices([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchSlices(currentPage);
  }, [currentPage]);

  const handleSearch = () => {
    fetchSlices(1);
  };

  const handleReset = () => {
    form.resetFields();
    setTrainStatus(null);
    fetchSlices(1);
  };

  const handleDelete = async (id: string) => {
    try {
      await knowledgeApi.deleteSlice(id);
      fetchSlices(currentPage);
    } catch (err) {
      console.error('删除切片失败:', err);
    }
  };

  const handleTrainStatusChange = (value: string) => {
    if (trainStatus === value) {
      setTrainStatus(null);
    } else {
      setTrainStatus(value);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%', marginBottom: '24px' }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: '20px' }}
        >
          <Form.Item name="knowledgeBaseId" label="知识库">
            <Select 
              style={{ width: 200 }} 
              placeholder="请选择知识库"
              allowClear
            >
              {(knowledgeBases || []).map(kb => (
                <Select.Option key={kb.system_kb_id} value={kb.system_kb_id}>{kb.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="fileName" label="文件名">
            <Input placeholder="请输入文件名" />
          </Form.Item>
          <Form.Item label="训练状态">
            <Radio.Group 
              value={trainStatus}
              buttonStyle="solid"
            >
              <Radio.Button 
                value="1" 
                onClick={() => handleTrainStatusChange('1')}
                style={trainStatus === '1' ? { backgroundColor: '#1890ff', color: '#fff' } : {}}
              >
                已训练
              </Radio.Button>
              <Radio.Button 
                value="0" 
                onClick={() => handleTrainStatusChange('0')}
                style={trainStatus === '0' ? { backgroundColor: '#1890ff', color: '#fff' } : {}}
              >
                未训练
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {(slices || []).map(slice => (
            <Card 
              key={slice.id}
              style={{ position: 'relative', overflow: 'visible' }}
            >
              {slice.sliceStatus === '1' && (
                <Badge.Ribbon 
                  text="已训练" 
                  color="blue" 
                  style={{ 
                    position: 'absolute',
                    transform: 'rotate(15deg)',
                    right: '-36px',
                    top: '-28px',
                    zIndex: 2
                  }} 
                />
              )}
              <div style={{ height: '250px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text ellipsis style={{ maxWidth: '70%' }}>{slice.name}</Text>
                  <Text>匹配: {slice.hitCount}</Text>
                </div>
                
                <div style={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  marginBottom: '12px'
                }}>
                  <Text>{slice.content}</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Text type="secondary">{slice.charCount} 字符</Text>
                    <Text type="secondary">{slice.createTime}</Text>
                  </Space>
                  <Popconfirm
                    title="确定要删除这个切片吗？"
                    onConfirm={() => handleDelete(slice.id)}
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Space>
      
      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          total={total}
          pageSize={pageSize}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default Slices;