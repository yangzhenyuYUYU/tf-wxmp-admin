import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Select, Space, message, Popconfirm, Modal, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons';
import { knowledgeApi, UploadMaterialParams, KnowledgeBase } from '../../../api/knowledge';
import { resourcesApi, ResourceName, ResourceType } from '../../../api/resources';

interface Material {
  id: string;
  dataset_id: string;
  name: string;
  knowledge_base_name: string;
  file_type: string;
  create_time: string;
  url: string;
  file_url: string;
}

const { Option } = Select;
const { Dragger } = Upload;

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    kb_url?: string;
    kb_object_name?: string;
    object_name?: string;
    size?: number;
    content_type?: string;
    resource_type?: string;
    resource_name?: string;
    description?: string;
    path?: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    try {
      const res = await knowledgeApi.getKnowledgeBases({ page: 1, size: 50 });  
      if (res.code === 0 && res.data) {
        setKnowledgeBases(res.data.items);
      } else {
        message.error(res.msg || '获取知识库列表失败');
      }
    } catch (error) {
      message.error('获取知识库列表失败');
    }
  };

  const fetchMaterials = async (params = {}) => {
    try {
      setLoading(true);
      const res = await knowledgeApi.getMaterials({ page: 1, size: 20, ...params });
      if (res.code === 0 && res.data) {
        const materialsWithUrl = res.data.items.map((item: any) => ({
          ...item,
          url: item.file_url || ''
        }));
        setMaterials(materialsWithUrl);
      } else {
        message.error(res.msg || '获取资料列表失败');
      }
    } catch (error) {
      message.error('获取资料列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const res = await resourcesApi.uploadFile(file as File, '', ResourceType.FILE, ResourceName.KNOWLEDGE);
      if (res.code === 0 && res.data) {
        const { kb_url, kb_object_name, object_name, url, filename, size, content_type, resource_type, resource_name, description, path } = res.data
        setUploadedFile({
          url,
          kb_url,
          kb_object_name,
          object_name,
          name: filename,
          size,
          content_type,
          resource_type,
          resource_name,
          description,
          path
        });
        return res.data.url;
      } else {
        message.error(res.msg || '文件上传失败');
        return false;
      }
    } catch (error) {
      message.error('文件上传失败');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleModalCancel = async () => {
    if (uploadedFile?.url) {
      try {
        await resourcesApi.deleteFile(uploadedFile.url);
      } catch (error) {
        console.error('删除文件失败:', error);
      }
    }
    setUploadedFile(null);
    setModalVisible(false);
    uploadForm.resetFields();
  };

  const handleUpload = async (values: any) => {
    if (!uploadedFile) {
      message.error('请先上传文件');
      return;
    }
    console.log(uploadedFile,'uploadedFile')
    try {

      const local_kb_id = knowledgeBases.find((kb: any) => kb.system_kb_id === values.knowledge_base_id)?.id;
      const uploadParams = {
        ...uploadedFile,
        local_kb_id
      } as UploadMaterialParams;
      const res = await knowledgeApi.uploadMaterial(values.knowledge_base_id, uploadParams);

      if (res.code === 0) {
        message.success('添加资料成功');
        setModalVisible(false);
        uploadForm.resetFields();
        setUploadedFile(null);
        fetchMaterials();
      } else {
        message.error(res.msg || '添加资料失败');
      }
    } catch (error) {
      message.error('添加资料失败');
    }
  };

  const handleSearch = async (values: any) => {
    await fetchMaterials(values);
  };

  const handleReset = () => {
    form.resetFields();
    fetchMaterials();
  };

  const handleBatchDelete = async () => {
    try {
      const res = await knowledgeApi.batchDeleteMaterials(selectedRowKeys);
      if (res.code === 0) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        fetchMaterials();
      } else {
        message.error(res.msg || '批量删除失败');
      }
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleDelete = async (record: Material) => {
    try {
      const res = await knowledgeApi.deleteMaterial(record.dataset_id, record.id); // 需要传入两个参数 kbId 和 materialId
      if (res.code === 0) {
        message.success('删除成功');
        fetchMaterials();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '资料名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Material) => (
        <a 
          href={record.file_url}
          style={{ 
            textDecoration: 'none',
            ':hover': {
              textDecoration: 'underline'
            }
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      )
    },
    {
      title: '所属知识库',
      dataIndex: 'dataset_id',
      key: 'dataset_id',
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      key: 'file_type',
      render: (type: string) => type?.toUpperCase() || '-'
    },
    {
      title: '切片数',
      dataIndex: 'slice_count',
      key: 'slice_count'
    },
    // {
    //   title: '文件大小',
    //   dataIndex: 'file_size',
    //   key: 'file_size',
    //   render: (size: number) => size ? `${(size / 1024 / 1024).toFixed(2)}MB` : '-'
    // },
    {
      title: '命中次数',
      dataIndex: 'hit_count',
      key: 'hit_count',
      render: (count: string) => count || '0'
    },
    {
      title: '切片状态',
      dataIndex: 'slice_status',
      key: 'slice_status',
      render: (status: string) => {
        switch(status) {
          case '1':
            return '成功';
          case '0':
            return '失败';
          default:
            return '处理中';
        }
      }
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Material) => (
        <Space>
          <Popconfirm
            title="确定要删除这份资料吗？"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ display: 'flex', marginBottom: 16, marginTop: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="knowledge_base_name" label="知识库名称">
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item name="file_type" label="文件类型">
            <Select style={{ width: 120 }} allowClear>
              <Option value="jpg">JPG</Option>
              <Option value="jpeg">JPEG</Option>
              <Option value="png">PNG</Option>
              <Option value="pdf">PDF</Option>
              <Option value="doc">DOC</Option>
              <Option value="docx">DOCX</Option>
              <Option value="txt">TXT</Option>
              <Option value="md">MD</Option>
              <Option value="xls">XLS</Option>
              <Option value="xlsx">XLSX</Option>
              <Option value="csv">CSV</Option>
            </Select>
          </Form.Item>
          <Form.Item name="name" label="文件名">
            <Input placeholder="请输入文件名" />
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
      </Space>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            添加资料
          </Button>
          <Popconfirm
            title="确定要删除选中的资料吗？"
            disabled={selectedRowKeys.length === 0}
            onConfirm={handleBatchDelete}
          >
            <Button 
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        columns={columns}
        dataSource={materials}
        rowKey="id"
      />

      <Modal
        title="添加资料"
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={() => uploadForm.submit()}
        confirmLoading={uploading}
      >
        <Form
          form={uploadForm}
          onFinish={handleUpload}
          layout="vertical"
        >
          <Form.Item
            name="knowledge_base_id"
            label="选择知识库"
            rules={[{ required: true, message: '请选择知识库' }]}
          >
            <Select placeholder="请选择知识库">
              {knowledgeBases.map((kb: any) => (
                <Select.Option key={kb.system_kb_id} value={kb.system_kb_id}>
                  {kb.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="上传资料"
            required
            help={uploadedFile ? `已选择文件: ${uploadedFile.name}` : '请上传文件'}
          >
            <Dragger
              maxCount={1}
              showUploadList={false}
              customRequest={async ({ file, onSuccess, onError }) => {
                const result = await handleFileUpload(file as File);
                if (result) {
                  onSuccess?.(result);
                } else {
                  onError?.(new Error('上传失败'));
                }
              }}
              beforeUpload={(file) => {
                const isValidType = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.txt', '.md', '.xls', '.xlsx', '.csv'].some(ext =>
                  file.name.toLowerCase().endsWith(ext)
                );
                if (!isValidType) {
                  message.error('只支持 JPG、JPEG、PNG、PDF、Word、TXT、Markdown、Excel、CSV 格式的文件');
                  return false;
                }
                return true;
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持 JPG、JPEG、PNG、PDF、Word、TXT、Markdown、Excel、CSV 格式</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Materials;
