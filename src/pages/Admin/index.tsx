import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Select, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminApi, AdminInfo, AdminRole, AdminStatus, AdminUpdateParams } from '../../api/admin';
import dayjs from 'dayjs';
import styles from './index.module.less';

const { Option } = Select;

const AdminList = () => {
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminInfo>();
  const [form] = Form.useForm();

  // 获取管理员列表
  const fetchAdmins = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const { code, data } = await adminApi.getAdmins({ page, size });
      if (code === 0 && data) {
        setAdmins(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      message.error('获取管理员列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理编辑
  const handleEdit = (admin: AdminInfo) => {
    setEditingAdmin(admin);
    form.setFieldsValue({
      real_name: admin.real_name,
      role: admin.role,
      status: admin.status,
    });
    setEditModalVisible(true);
  };

  // 处理更新
  const handleUpdate = async () => {
    try {
      if (!editingAdmin) return;
      const values = await form.validateFields();
      const { code } = await adminApi.updateAdmin(editingAdmin.id, values);
      
      if (code === 0) {
        message.success('更新成功');
        setEditModalVisible(false);
        fetchAdmins();
      }
    } catch (error) {
      console.error('更新管理员失败:', error);
      message.error('更新失败');
    }
  };

  // 处理删除
  const handleDelete = (admin: AdminInfo) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除管理员 ${admin.username} 吗？`,
      onOk: async () => {
        try {
          const { code } = await adminApi.deleteAdmin(admin.id);
          if (code === 0) {
            message.success('删除成功');
            fetchAdmins();
          }
        } catch (error) {
          console.error('删除管理员失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<AdminInfo> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 120,
      render: (role: AdminRole) => (
        <Tag color={
          role === AdminRole.SUPER_ADMIN ? 'red' :
          role === AdminRole.ADMIN ? 'blue' :
          'green'
        }>
          {role === AdminRole.SUPER_ADMIN ? '超级管理员' :
           role === AdminRole.ADMIN ? '管理员' :
           '运营'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: AdminStatus) => (
        <Tag color={
          status === AdminStatus.NORMAL ? 'success' :
          status === AdminStatus.DISABLED ? 'warning' :
          'error'
        }>
          {status === AdminStatus.NORMAL ? '正常' :
           status === AdminStatus.DISABLED ? '禁用' :
           '已删除'}
        </Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      width: 180,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            onClick={() => handleDelete(record)}
            disabled={record.role === AdminRole.SUPER_ADMIN}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className={styles.adminList}>
      <Table
        columns={columns}
        dataSource={admins}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
            fetchAdmins(page, size);
          },
        }}
      />

      <Modal
        title="编辑管理员"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="real_name"
            label="真实姓名"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value={AdminRole.ADMIN}>管理员</Option>
              <Option value={AdminRole.OPERATOR}>运营</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value={AdminStatus.NORMAL}>正常</Option>
              <Option value={AdminStatus.DISABLED}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminList; 