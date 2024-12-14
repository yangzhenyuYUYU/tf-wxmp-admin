import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, message, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { aiApi } from '../../../api/ai';

const OCRModel: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // OCR供应商配置
  const providers = [
    { label: '百度智能云', value: 'baidu', disabled: true },
    { label: '腾讯云', value: 'tencent', disabled: true }, 
    { label: 'Azure', value: 'azure', disabled: true },
    { label: '阿里云', value: 'aliyun', disabled: true },
    { label: '智谱AI', value: 'zhipuai', disabled: false },
  ];

  // 供应商对应的模型
  const providerModels = {
    baidu: [
      { label: '通用文字识别', value: 'general_basic', disabled: true },
      { label: '通用文字识别（高精度）', value: 'accurate_basic', disabled: true },
      { label: '通用文字识别（含位置）', value: 'general', disabled: true },
    ],
    tencent: [
      { label: '通用印刷体识别', value: 'GeneralBasicOCR', disabled: true },
      { label: '通用印刷体识别（高精度）', value: 'GeneralAccurateOCR', disabled: true },
      { label: '通用印刷体识别（含位置）', value: 'GeneralOCR', disabled: true },
    ],
    azure: [
      { label: '通用文字识别', value: 'ocr', disabled: true },
      { label: '通用文字识别（预览版）', value: 'ocr-preview', disabled: true },
    ],
    aliyun: [
      { label: '通用文字识别', value: 'general', disabled: true },
      { label: '通用文字识别（高精度）', value: 'general_precise', disabled: true },
    ],
    zhipuai: [
      { label: 'GLM-4V-PLUS', value: 'glm-4v-plus', disabled: false },
    ],
  };

  // 供应商对应的 baseURL
  const providerBaseURLMap = {
    baidu: 'https://aip.baidubce.com/rest/2.0/ocr/v1',
    tencent: 'https://ocr.tencentcloudapi.com',
    azure: 'https://{region}.api.cognitive.microsoft.com/vision/v3.2',
    aliyun: 'https://ocr.cn-shanghai.aliyuncs.com',
    zhipuai: 'https://open.bigmodel.cn/api/paas/v4',
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await aiApi.getOCRConfig();
      if (res.code === 0 && res.data) {
        // 处理 extData，将对象转换为格式化的 JSON 字符串
        const formData = {
          ...res.data,
          extData: res.data.extData ? JSON.stringify(res.data.extData, null, 2) : undefined
        };
        form.setFieldsValue(formData);
      }
    } catch (error) {
      message.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value: keyof typeof providerModels) => {
    form.setFieldsValue({
      baseUrl: providerBaseURLMap[value] || '',
      modelName: undefined
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // 处理 extData，将 JSON 字符串解析为对象
      const submitData = {
        ...values,
        extData: values.extData ? JSON.parse(values.extData) : undefined
      };
      
      const res = await aiApi.updateOCRConfig(submitData);
      if (res.code === 0) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      // 添加 JSON 解析错误的特殊处理
      if (error instanceof SyntaxError) {
        message.error('扩展参数 JSON 格式错误，请检查');
      } else {
        message.error('保存失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 添加 JSON 格式验证函数
  const validateJSON = (_: any, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    try {
      JSON.parse(value);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject('请输入有效的 JSON 格式');
    }
  };

  return (
    <Card title="OCR模型配置" loading={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 800 }}
      >
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

        <Form.Item
          name="modelName"
          rules={[{ required: true, message: '请选择模型标识' }]}
          label={
            <Space>
              模型标识
              <Tooltip title="不同供应商支持的模型类型">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Select
            placeholder="请选择模型标识"
            options={providerModels[form.getFieldValue('provider')] || []}
          />
        </Form.Item>

        <Form.Item
          name="baseUrl"
          label="接口地址"
          rules={[{ required: true, message: '请输入接口地址' }]}
        >
          <Input placeholder="请输入接口地址" />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label="API Key"
          rules={[{ required: true, message: '请输入API Key' }]}
        >
          <Input 
            placeholder="请输入API Key"
            type="text"
          />
        </Form.Item>

        {/* <Form.Item
          name="secretKey"
          label="Secret Key"
          rules={[{ required: true, message: '请输入Secret Key' }]}
        >
          <Input 
            placeholder="请输入Secret Key"
            type="text"
          />
        </Form.Item> */}

        <Form.Item
          name="region"
          label="区域"
          tooltip="部分供应商需要配置区域信息"
        >
          <Input placeholder="请输入区域信息" />
        </Form.Item>

        <Form.Item
          name="extData"
          label="扩展参数"
          tooltip="JSON格式的额外配置参数"
          rules={[
            { validator: validateJSON }
          ]}
        >
          <Input.TextArea 
            rows={8} 
            placeholder={`请输入JSON格式的扩展参数，例如：
            {
            "key1": "value1",
            "key2": {
                "nestedKey": "nestedValue"
            }
            }`}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default OCRModel;