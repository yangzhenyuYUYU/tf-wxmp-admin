import { Card, Table, Button, Modal, Form, Input, message, Tag, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { announcementApi, Announcement, CreateAnnouncementParams } from '../../api/announcement';

interface TableAnnouncement extends Omit<Announcement, 'status'> {
  status: 'active' | 'inactive';
}

const statusMap = {
  0: 'inactive',
  1: 'active'
} as const;

const reverseStatusMap = {
  'inactive': 0,
  'active': 1
} as const;

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<TableAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [form] = Form.useForm();

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'normal' ? 'green' : 'red'}>
          {type === 'normal' ? '普通' : '重要'}
        </Tag>
      ),
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
      title: '绑定用户',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (user_id: string) => (
        <Tag color={user_id ? 'green' : 'red'}>
          {user_id ? '已绑定' : '未绑定'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TableAnnouncement) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id.toString())}>
            删除
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const result = await announcementApi.getAnnouncements({ page, size });
      const items = result.data.items.map((item: Announcement) => ({
        ...item,
        status: statusMap[item.status as 0 | 1]
      }));
      setAnnouncements(items);
      setPagination({
        ...pagination,
        current: page,
        total: result.data.total,
      });
    } catch (error) {
      message.error('获取公告失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: TableAnnouncement) => {
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handlePreview = (record: TableAnnouncement) => {
    Modal.info({
      title: record.title,
      content: (
        <div dangerouslySetInnerHTML={{ __html: record.content }} />
      ),
      width: 600,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementApi.deleteAnnouncement(id);
      message.success('删除成功');
      fetchAnnouncements(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData: CreateAnnouncementParams = {
        ...values,
        status: reverseStatusMap[values.status as keyof typeof reverseStatusMap],
      };
      
      if (form.getFieldValue('id')) {
        await announcementApi.updateAnnouncement(
          form.getFieldValue('id'),
          submitData
        );
      } else {
        await announcementApi.createAnnouncement(submitData);
      }
      
      message.success('保存成功');
      setModalVisible(false);
      fetchAnnouncements(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('保存失败');
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
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              fetchAnnouncements(page, pageSize);
            },
          }}
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
          onFinish={handleSubmit}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item
            label="类型"
            name="type"
            initialValue="normal"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Select.Option value="normal">普通</Select.Option>
              <Select.Option value="important">重要</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            initialValue="active"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="active">发布</Select.Option>
              <Select.Option value="inactive">草稿</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="绑定用户ID"
            name="user_id"
          >
            <Input placeholder="请输入用户ID" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Announcements;