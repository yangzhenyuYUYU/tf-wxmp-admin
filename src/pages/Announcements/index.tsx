import { Card, Table, Button, Modal, Form, Input, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  status: 'active' | 'inactive';
  createTime: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '已发布' : '未发布'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Announcement) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch('/api/announcements');
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      message.error('获取公告失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Announcement) => {
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handlePreview = (record: Announcement) => {
    Modal.info({
      title: record.title,
      content: (
        <div dangerouslySetInnerHTML={{ __html: record.content }} />
      ),
      width: 600,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: 替换为实际的 API 调用
      await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      fetchAnnouncements();
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="公告管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setModalVisible(true);
            }}
          >
            发布公告
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={announcements}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title={form.getFieldValue('id') ? '编辑公告' : '发布公告'}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              // TODO: 替换为实际的 API 调用
              await fetch('/api/announcements', {
                method: form.getFieldValue('id') ? 'PUT' : 'POST',
                body: JSON.stringify(values),
              });
              message.success('保存成功');
              setModalVisible(false);
              fetchAnnouncements();
            } catch (error) {
              message.error('保存失败');
            }
          }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">发布</Select.Option>
              <Select.Option value="inactive">草稿</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Announcements; 