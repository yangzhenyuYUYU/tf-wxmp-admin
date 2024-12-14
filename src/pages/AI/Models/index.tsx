import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Row, Col, Slider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { aiApi, AIModel } from '../../../api/ai';
import { providers, modelTypes, providerModels, providerBaseURLMap } from './modelConfig';

type Provider = keyof typeof providerModels;

const Models: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<{type: string, model: string}[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedType, setSelectedType] = useState<string>('');

  // 添加供应商映射
  const providerLabelMap = Object.fromEntries(
    providers.map(p => [p.value, p.label])
  );

  // 添加类型映射
  const modelTypeLabelMap = Object.fromEntries(
    modelTypes.map(t => [t.value, t.label])
  );

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '模型标识',
      dataIndex: 'modelName',
      key: 'modelName',
    },
    {
      title: '供应商',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => providerLabelMap[provider] || provider
    },
    {
      title: '类型',
      dataIndex: 'modelType',
      key: 'modelType',
      render: (type: string) => modelTypeLabelMap[type] || type
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AIModel) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个模型吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleEdit = (model: AIModel) => {
    setEditingId(model.id);
    
    const formValues = {
      provider: model.provider,
      modelType: model.modelType,
      modelName: model.modelName,
      name: model.name,
      apiKey: model.apiKey,
      baseUrl: model.baseUrl,
      secretKey: model.secretKey,
      responseLimit: model.responseLimit,
      temperature: model.temperature,
      topP: model.topP,
      defaultModel: model.defaultModel,
      endpoint: model.endpoint,
      extData: model.extData,
      azureDeploymentName: model.azureDeploymentName,
      geminiProject: model.geminiProject,
      geminiLocation: model.geminiLocation,
      imageSize: model.imageSize,
      imageQuality: model.imageQuality,
      imageStyle: model.imageStyle
    };

    handleProviderChange(model.provider as Provider);
    handleTypeChange(model.modelType);
    
    form.setFieldsValue(formValues);
    
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await aiApi.deleteModel(id);
      if (response.code === 0) {
        message.success('删除成功');
        fetchModels();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        modelType: values.modelType,
        modelName: values.modelName,
        provider: values.provider,
        name: values.name,
        apiKey: values.apiKey,
        baseUrl: values.baseUrl,
        secretKey: values.secretKey,
        responseLimit: values.responseLimit,
        temperature: values.temperature,
        topP: values.topP,
        defaultModel: values.defaultModel,
        endpoint: values.endpoint,
        extData: values.extData,
        azureDeploymentName: values.azureDeploymentName,
        geminiProject: values.geminiProject,
        geminiLocation: values.geminiLocation,
        imageSize: values.imageSize,
        imageQuality: values.imageQuality,
        imageStyle: values.imageStyle
      };

      if (editingId) {
        await aiApi.updateModel(editingId, submitData);
      } else {
        await aiApi.createModel(submitData);
      }
      message.success(editingId ? '编辑成功' : '添加成功');
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchModels();

    } catch (error) {
      message.error('操作失败');
    }
  };

  const fetchModels = async (
    page = pagination.current,
    size = pagination.pageSize,
    type = selectedType
  ) => {
    try {
      setLoading(true);
      const res = await aiApi.getModels({ 
        page, 
        size,
        modelType: type
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

  useEffect(() => {
    fetchModels();
  }, []);

  const handleProviderChange = (value: Provider) => {
    form.setFieldsValue({
      baseUrl: providerBaseURLMap[value] || '',
      modelType: undefined,
      modelName: undefined
    });
    setAvailableModels([]);
  };

  const handleTypeChange = (value: string) => {
    const provider = form.getFieldValue('provider');
    if (provider && value) {
      setAvailableModels(
        (providerModels[provider as Provider] || []).filter(m => m.type === value)
      );
    }
    form.setFieldsValue({ modelName: undefined });
  };

  const currentModelType = Form.useWatch('modelType', form);

  useEffect(() => {
    const modelType = form.getFieldValue('modelType');
    if (modelType === 'Chat') {
      form.setFieldsValue({
        responseLimit: form.getFieldValue('responseLimit') || 1555,
        temperature: form.getFieldValue('temperature') || 0.7,
        topP: form.getFieldValue('topP') || 0.9
      });
    }
  }, [form.getFieldValue('modelType')]);

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            添加模型
          </Button>
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="按类型筛选"
            allowClear
            value={selectedType}
            onChange={(value) => {
              setSelectedType(value);
              setPagination(prev => ({ ...prev, current: 1 }));
              fetchModels(1, pagination.pageSize, value);
            }}
            options={[
              { label: '全部', value: '' },
              ...modelTypes
            ]}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={models}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total
        }}
        onChange={(pagination) => fetchModels(
          pagination.current,
          pagination.pageSize,
          selectedType
        )}
      />

      <Modal
        title={editingId ? '编辑模型' : '添加模型'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            responseLimit: 1555,
            temperature: 0.7,
            topP: 0.9
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="provider"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select 
                  placeholder="请选择供应商"
                  onChange={handleProviderChange}
                  options={providers}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="modelType"
                label="类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select 
                  placeholder="请选择类型"
                  options={modelTypes}
                  onChange={handleTypeChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="modelName"
                label={
                  <Space>
                    模型标识
                    <QuestionCircleOutlined />
                  </Space>
                }
                rules={[{ required: true, message: '请选择模型标识' }]}
              >
                <Select placeholder="请选择模型标识">
                  {availableModels.map(m => (
                    <Select.Option key={m.model} value={m.model}>
                      {m.model}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="别名"
                rules={[{ required: true, message: '请输入别名' }]}
              >
                <Input placeholder="请输入别名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="apiKey"
                label="apiKey"
                rules={[{ required: true, message: '请输入apiKey' }]}
              >
                <Input placeholder="请输入apiKey" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="baseUrl"
                label="baseUrl"
                rules={[{ required: true, message: '请输入baseUrl' }]}
              >
                <Input placeholder="请输入baseUrl" />
              </Form.Item>
            </Col>
          </Row>

          {currentModelType === 'Chat' && (
            <>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="responseLimit"
                    label="响应限制"
                  >
                    <Slider
                      min={0}
                      max={4096}
                      defaultValue={1555}
                      marks={{
                        0: '0',
                        4096: '4096'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="temperature"
                    label="随机性"
                  >
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      defaultValue={0.7}
                      marks={{
                        0: '0',
                        1: '1'
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="topP"
                    label="词频控制"
                  >
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      defaultValue={0.9}
                      marks={{
                        0: '0',
                        1: '1'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Form.Item
            name="extData"
            label="特殊参数"
          >
            <Input.TextArea rows={4} placeholder="请输入特殊参数" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Models;
