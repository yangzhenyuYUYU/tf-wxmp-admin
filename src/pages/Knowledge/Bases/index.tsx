import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Upload, message, Popconfirm, Empty, Spin, Pagination, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import { knowledgeApi } from '../../../api/knowledge';
import { resourcesApi, ResourceName, ResourceType } from '../../../api/resources';
import type { KnowledgeBase } from '../../../api/knowledge';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { aiApi, AIModel } from '../../../api/ai';

const CARD_MIN_WIDTH = 240; // 最小宽度
const CARD_MAX_PER_ROW = 5; // 每行最多显示数量
const CARD_GAP = 16; // 卡片间距

const Bases: React.FC = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [kbUrl, setKbUrl] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  useEffect(() => {
    fetchKnowledgeBases();
    fetchModels();

  }, []);

  const fetchModels = async (
    page = pagination.current,
    size = pagination.pageSize,
  ) => {
    try {
      setLoading(true);
      const res = await aiApi.getModels({ 
        page, 
        size,
        modelType: 'Embedding'
      });
      if (res.code === 0 && res.data) {
        setModels(res.data.records || []);
        setPagination({
          ...pagination,
          current: page,
          total: res.data.total
        });
      } else {
        message.error(res.msg || '获取模型列表失败');
      }
    } catch (error) {
      message.error('获取模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeBases = async (page = pagination.current, size = pagination.pageSize) => {
    try {
      setLoading(true);
      const res = await knowledgeApi.getKnowledgeBases({ page, size });
      if (res.code === 0 && res.data) {
        setKnowledgeBases(res.data.items);
        setPagination({
          ...pagination,
          current: page,
          total: res.data.total
        });
      } else {
        message.error(res.msg || '获取知识库列表失败');
      }
    } catch (error) {
      message.error('获取知识库列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    // 检查文件类型
    const isImage = file instanceof File && file.type.startsWith('image/');
    if (!isImage) {
      message.error('只支持上传图片格式文件');
      onError?.(new Error('只支持上传图片格式文件'));
      return;
    }

    try {
      setUploadLoading(true);
      const res = await resourcesApi.uploadFile(file as File, '', ResourceType.IMAGE, ResourceName.KNOWLEDGE);
      if (res.code === 0 && res.data) {
        onSuccess?.(res.data);
        form.setFields([{
          name: 'cover_url',
          value: res.data,
          errors: []
        }]);
        if (res.data.kb_url) {
          setKbUrl(res.data.kb_url);
        }
      } else {
        onError?.(new Error(res.msg || '上传失败'));
        message.error(res.msg || '上传失败');
      }
    } catch (error) {
      onError?.(error as Error);
      message.error('上传失败');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!editingId && !values.cover_url) {
        message.error('请上传封面图片');
        return;
      }

      const formData = {
        name: values.name,
        cover_url: typeof values.cover_url === 'string' 
          ? values.cover_url 
          : values.cover_url?.response?.url || values.cover_url?.url,
        embedding_model: values.embedding_model,
        kb_url: kbUrl,
        welcome_prompt: values.welcome_prompt
      };

      if (editingId) {
        const res = await knowledgeApi.updateKnowledgeBase(editingId, formData);
        if (res.code === 0) {
          message.success('编辑成功');
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
          fetchKnowledgeBases();
        } else {
          message.error(res.msg || '编辑失败');
        }
      } else {
        const res = await knowledgeApi.createKnowledgeBase(formData);
        if (res.code === 0) {
          message.success('创建成功');
          setModalVisible(false);
          form.resetFields();
          fetchKnowledgeBases();
        } else {
          message.error(res.msg || '创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await knowledgeApi.deleteKnowledgeBase(id);
      if (res.code === 0) {
        message.success('删除成功');
        fetchKnowledgeBases();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const showEditModal = (knowledgeBase: KnowledgeBase) => {
    setEditingId(knowledgeBase.id);
    form.setFieldsValue({
      name: knowledgeBase.name,
      cover_url: knowledgeBase.cover_url,
    });
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCoverRemove = async (file: UploadFile) => {
    try {
      // 清理表单字段
      form.setFields([{
        name: 'cover_url',
        value: undefined,
        errors: []
      }]);
      
      // 如果有文件URL，尝试删除文件
      const fileUrl = file.response?.url || file.url;
      if (fileUrl) {
        await resourcesApi.deleteFile(fileUrl);
      }
      
      // 重置kb_url
      setKbUrl('');
      
      return true;
    } catch (error) {
      message.error('删除封面失败');
      return false;
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchKnowledgeBases(page, pageSize);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 200px)' 
        }}>
          <Spin />
        </div>
      );
    }

    if (knowledgeBases.length === 0) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 200px)' 
        }}>
          <Empty description="暂无知识库" />
        </div>
      );
    }

    return (
      <div 
        className={styles.cardsContainer} 
        style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
          gap: CARD_GAP,
          gridAutoRows: 'auto',
          justifyItems: 'stretch',
          maxWidth: `calc(${CARD_MAX_PER_ROW} * (${CARD_MIN_WIDTH}px + ${CARD_GAP}px))`,
          margin: '0 auto'
        }}
      >
        {knowledgeBases.map((kb) => (
          <Card
            key={kb.id}
            className={styles.card}
            size="small"
            style={{
              width: '100%',  // 使用100%宽度填充网格
              height: '100%'  // 确保卡片高度一致
            }}
            cover={
              <div style={{ height: 150, overflow: 'hidden' }}>
                <img 
                  alt={kb.name} 
                  src={kb.cover_url} 
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://picsum.photos/300/200?random=2';
                  }}
                />
              </div>
            }
            actions={[
              <Button 
                type="text"
                size="small"
                icon={<EditOutlined />} 
                onClick={() => showEditModal(kb)}
              >
                编辑
              </Button>,
              <Popconfirm
                title="确定要删除这个知识库吗？"
                onConfirm={() => handleDelete(kb.system_kb_id)}
              >
                <Button 
                  type="text" 
                  size="small" 
                  icon={<DeleteOutlined />} 
                  danger
                >
                  删除
                </Button>
              </Popconfirm>
            ]}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 8 
            }}>
              <h4 style={{ 
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {kb.name}
              </h4>
              <span style={{ fontSize: 12, color: '#999' }}>
                {kb.materials_count} 份资料
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              创建时间: {formatDate(kb.create_time)}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const handleModalClose = async () => {
    // 获取当前的封面URL
    const coverUrl = form.getFieldValue('cover_url');
    
    // 如果是新建模式且有上传的封面，需要清理
    if (!editingId && coverUrl) {
      const fileUrl = typeof coverUrl === 'string' 
        ? coverUrl 
        : coverUrl?.response?.url || coverUrl?.url;
      
      if (fileUrl) {
        try {
          await resourcesApi.deleteFile(fileUrl);
        } catch (error) {
          console.error('删除文件失败:', error);
        }
      }
    }

    // 重置所有相关状态
    setModalVisible(false);
    form.resetFields();
    setEditingId(null);
    setKbUrl('');
  };

  return (
    <div className={styles.container}>
      <Button 
        type="primary" 
        icon={<PlusOutlined />}
        onClick={() => {
          setModalVisible(true);
          setEditingId(null);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        添加知识库
      </Button>

      {renderContent()}

      {!loading && knowledgeBases.length > 0 && (
        <div style={{ 
          marginTop: 16, 
          textAlign: 'right',
          maxWidth: `calc(${CARD_MAX_PER_ROW} * (${CARD_MIN_WIDTH}px + ${CARD_GAP}px))`,
          margin: '16px auto 0'
        }}>
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={handlePageChange}
            showTotal={(total) => `共 ${total} 条`}
            showSizeChanger={false}
          />
        </div>
      )}

      <Modal
        title={editingId ? '编辑知识库' : '添加知识库'}
        open={modalVisible}
        onCancel={handleModalClose}
        onOk={() => form.submit()}
        confirmLoading={uploadLoading}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>

          <Form.Item
            name="embedding_model"
            label="向量模型"
            rules={[{ required: true, message: '请选择向量模型' }]}
          >
            <Select placeholder="请选择向量模型">
              {models.map((model) => (
                <Select.Option key={model.name} value={model.name}>
                  {model.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="welcome_prompt"
            label="欢迎语"
            rules={[{ required: true, message: '请输入欢迎语' }]}
          >
            <Input.TextArea 
              placeholder="请输入欢迎语" 
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="cover_url"
            label="封面图片"
            rules={[{ required: !editingId, message: '请上传封面图片' }]}
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              if (!e?.fileList?.length) {
                return undefined;
              }
              const file = e?.fileList[0];
              return file.response || file;
            }}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              customRequest={handleUpload}
              showUploadList={true}
              onRemove={handleCoverRemove}
              accept="image/*"
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('只支持上传图片格式文件');
                }
                return isImage;
              }}
              onPreview={(file) => {
                const url = file.response?.url || file.url;
                if (url) {
                  window.open(url);
                }
              }}
              fileList={form.getFieldValue('cover_url') ? [{
                uid: '-1',
                name: 'cover',
                status: 'done',
                url: typeof form.getFieldValue('cover_url') === 'string' 
                  ? form.getFieldValue('cover_url') 
                  : form.getFieldValue('cover_url')?.url || form.getFieldValue('cover_url')?.response?.url
              }] : []}
            >
              {!form.getFieldValue('cover_url') && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传封面</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Bases;
