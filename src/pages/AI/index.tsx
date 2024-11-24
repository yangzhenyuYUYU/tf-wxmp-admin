import { Form, Input, Switch, Card, Button } from 'antd';

const AI = () => {
  return (
    <Card title="AI 配置">
      <Form layout="vertical">
        <Form.Item label="API Key" name="apiKey">
          <Input.Password />
        </Form.Item>
        
        <Form.Item label="模型选择" name="model">
          <Input />
        </Form.Item>
        
        <Form.Item label="最大响应长度" name="maxLength">
          <Input type="number" />
        </Form.Item>
        
        <Form.Item label="启用AI助手" name="enabled" valuePropName="checked">
          <Switch />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary">保存设置</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AI; 