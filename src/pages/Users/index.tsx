import { useEffect, useState } from 'react';
import { Table, Card, Space, Tag, Button, Modal, Form, Select, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userApi, User, UserRole, AccountStatus, UserUpdateParams } from '../../api/users';
import dayjs from 'dayjs';
import styles from './index.module.less';

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string>();

  // 获取用户列表
  const fetchUsers = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const values = await searchForm.validateFields();
      const { code, data } = await userApi.getUsers({
        page,
        size,
        ...values
      });
      
      if (code === 0 && data) {
        setUsers(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    setCurrentPage(1);
    fetchUsers(1);
  };

  // 处理编辑
  const handleEdit = (user: User) => {
    setEditingUserId(user.user_id);
    editForm.setFieldsValue({
      role: user.role,
      status: user.status,
      is_verified: user.is_verified
    });
    setEditModalVisible(true);
  };

  // 处理更新
  const handleUpdate = async () => {
    try {
      if (!editingUserId) return;
      const values = await editForm.validateFields();
      const { code } = await userApi.updateUser(editingUserId, values);
      
      if (code === 0) {
        message.success('更新成功');
        setEditModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('更新用户失败:', error);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: UserRole) => (
        <Tag color={
          role === UserRole.ADMIN ? 'red' :
          role === UserRole.TEACHER ? 'green' :
          role === UserRole.STUDENT ? 'blue' :
          'default'
        }>
          {role}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AccountStatus) => (
        <Tag color={status === AccountStatus.NORMAL ? 'success' : 'error'}>
          {status === AccountStatus.NORMAL ? '正常' : '已删除'}
        </Tag>
      ),
    },
    {
      title: '认证状态',
      dataIndex: 'is_verified',
      key: 'is_verified',
      width: 100,
      render: (verified: boolean) => (
        <Tag color={verified ? 'success' : 'default'}>
          {verified ? '已认证' : '未认证'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={styles.users}>
      <Card>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          className={styles.searchForm}
        >
          <Form.Item name="keyword">
            <Input placeholder="搜索用户ID/昵称/真实姓名" allowClear />
          </Form.Item>
          <Form.Item name="role">
            <Select style={{ width: 120 }} allowClear placeholder="选择角色">
              {Object.values(UserRole).map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status">
            <Select style={{ width: 120 }} allowClear placeholder="选择状态">
              <Option value={AccountStatus.NORMAL}>正常</Option>
              <Option value={AccountStatus.REMOVE}>已删除</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 用户列表 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="user_id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              fetchUsers(page, size);
            },
          }}
        />
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              {Object.values(UserRole).map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value={AccountStatus.NORMAL}>正常</Option>
              <Option value={AccountStatus.REMOVE}>已删除</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="is_verified"
            label="认证状态"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>已认证</Option>
              <Option value={false}>未认证</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 