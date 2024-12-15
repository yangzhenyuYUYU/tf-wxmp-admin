// src/pages/AI/LLMModel.tsx
import { Card, Form, Input, Select, InputNumber, Button, message, Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import { aiApi, type LLMConfig } from '../../../api/ai';

const LLMModel = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const supportedProviders = [
    { name: 'zhipuai', label: '智谱AI', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', disabled: false },
    { name: 'aliyun', label: '阿里云通义千问', baseUrl: 'https://dashscope.aliyuncs.com/api/v1', disabled: true },
    { name: 'azure', label: 'Azure OpenAI', baseUrl: 'https://{region}.api.cognitive.microsoft.com', disabled: true },
    { name: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', disabled: true },
    { name: 'anthropic', label: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', disabled: true },
    { name: 'google', label: 'Google AI', baseUrl: 'https://generativelanguage.googleapis.com/v1', disabled: true },
    { name: 'baidu', label: '百度文心一言', baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop', disabled: true },
    { name: 'tencent', label: '腾讯混元', baseUrl: 'https://hunyuan.cloud.tencent.com/hyllm/v1', disabled: true },
    { name: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', disabled: true },
    { name: 'minimax', label: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1', disabled: true },
    { name: 'moonshot', label: '阶跃星辰', baseUrl: 'https://api.moonshot.cn/v1', disabled: true }
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await aiApi.getLLMConfig();
      if (res.code === 0 && res.data) {
        form.setFieldsValue({
          ...res.data,
          extData: {
            systemPrompt: res.data.extData?.systemPrompt || ''
          }
        });
      }
    } catch (error) {
      message.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value: string) => {
    const selectedProvider = supportedProviders.find(p => p.name === value);
    if (selectedProvider) {
      form.setFieldValue('baseUrl', selectedProvider.baseUrl);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const submitData: LLMConfig = {
        provider: values.provider,
        modelName: values.modelName,
        baseUrl: values.baseUrl,
        apiKey: values.apiKey,
        temperature: values.temperature,
        topP: values.topP,
        maxTokens: values.maxTokens,
        extData: {
          systemPrompt: values.extData?.systemPrompt
        }
      };

      const res = await aiApi.updateLLMConfig(submitData);
      if (res.code === 0) {
        message.success('保存成功');
        fetchConfig(); // 重新加载配置
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card title="语言模型配置" loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            provider: 'zhipuai',
            temperature: 0.7,
            topP: 0.8,
            maxTokens: 1500
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="模型提供商"
                name="provider"
                rules={[{ required: true, message: '请选择模型提供商' }]}
              >
                <Select
                  options={supportedProviders.map(p => ({ label: p.label, value: p.name, disabled: p.disabled }))}
                  onChange={handleProviderChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="模型名称"
                name="modelName"
                rules={[{ required: true, message: '请输入模型名称' }]}
              >
                <Input placeholder="请输入模型名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Base URL"
                name="baseUrl"
                rules={[{ required: true, message: '请输入接口地址' }]}
              >
                <Input placeholder="请输入接口地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="API Key"
                name="apiKey"
                rules={[{ required: true, message: '请输入API Key' }]}
              >
                <Input.Password placeholder="请输入API Key" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="系统提示词" 
            name={['extData', 'systemPrompt']}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="请输入系统提示词"
            />
          </Form.Item>

          <Card title="模型参数配置" size="small">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item 
                  label="Temperature" 
                  name="temperature"
                  rules={[{ required: true, message: '请输入temperature' }]}
                >
                  <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  label="Top P" 
                  name="topP"
                  rules={[{ required: true, message: '请输入topP' }]}
                >
                  <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  label="Max Tokens" 
                  name="maxTokens"
                  rules={[{ required: true, message: '请输入maxTokens' }]}
                >
                  <InputNumber min={1} max={4096} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item style={{ marginTop: 16, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LLMModel;