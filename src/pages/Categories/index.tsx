import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Button, Space, Form, Input, InputNumber, Modal, message, Select, Tag, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { categoryApi, Category, CategoryCreateParams } from '../../api/category';
// 获取知识库
import { knowledgeApi, KnowledgeBase } from '../../api/knowledge';

interface LevelStats {
  total_levels: number;
  level_counts: Record<string, number>;
}

const CategoryList = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category>();
  const [form] = Form.useForm();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  // 分页
  const actionRef = useRef<ActionType>();
  // 获取知识库
  const fetchKnowledgeBases = useCallback(async () => {
    const res = await knowledgeApi.getKnowledgeBases({ page: 1, size: 100 });
    if (res.code === 0) {
      setKnowledgeBases(res.data.items);
    } else {
      message.error('获取知识库列表失败');
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);


  const columns: ProColumns<Category>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '标识',
      dataIndex: 'key',
      tooltip: '格式如：1-1, 1-1-2，表示层级关系',
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      width: 100,
      valueType: 'select',
      valueEnum: {
        10: { text: '10' },
        20: { text: '20' },
        30: { text: '30' },
        40: { text: '40' },
        50: { text: '50' },
      },
    },
    {
      title: '知识库',
      dataIndex: 'is_bound_kb',
      valueType: 'select',
      valueEnum: {
        0: { text: '未绑定' },
        1: { text: '已绑定' },
      },
      render: (_, record) => {
        return record.knowledge_base_id ? (
          <span style={{ color: '#52c41a' }}>已绑定</span>
        ) : (
          <span style={{ color: '#999' }}>未绑定</span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_, record) => [
        <a key="edit" onClick={() => handleEdit(record)}>
          编辑
        </a>,
        <Button 
          key="delete" 
          type="link" 
          danger
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>,
      ],
    },
  ];

  const handleCreate = async (values: CategoryCreateParams) => {
    try {
      await categoryApi.createCategory(values);
      message.success('创建成功');
      setCreateModalVisible(false);
      actionRef.current?.reload();
      form.resetFields();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setEditModalVisible(true);
    form.setFieldsValue(category);
  };

  const handleUpdate = async (values: CategoryCreateParams) => {
    if (!currentCategory) return;
    try {
      await categoryApi.updateCategory(currentCategory.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      actionRef.current?.reload();
      form.resetFields();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = async (category: Category) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类"${category.name}"吗？`,
      onOk: async () => {
        try {
          await categoryApi.deleteCategory(category.id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const LevelSelector: React.FC<{
    value?: string;
    onChange?: (value: string) => void;
  }> = ({ value, onChange }) => {
    const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
    const [levelStats, setLevelStats] = useState<LevelStats>();
    const [inputValue, setInputValue] = useState<number | null>(null);
    
    useEffect(() => {
      if (value) {
        const keys = value.split('-').map(Number);
        setSelectedKeys(keys);
      }
    }, [value]);

    useEffect(() => {
      loadLevelStats();
    }, []);

    const loadLevelStats = async () => {
      try {
        const stats = await categoryApi.getCategoryStats();
        if (stats.code === 0 && stats.data) {
          setLevelStats(stats.data);
        }
      } catch (error) {
        console.error('层级统计加载错误:', error);
        message.error('加载层级统计失败');
      }
    };

    // 获取当前层级的最大可选值
    const getMaxNumber = (level: number) => {
      return (levelStats?.level_counts[level] || 0) + 1;
    };

    // 验证输入值是否有效
    const isValidInput = () => {
      // 获取当前要添加的层级
      const currentLevel = selectedKeys.length + 1;
      // 检查输入值是否在有效范围内
      return inputValue !== null && Number(inputValue) <= ((levelStats?.level_counts[currentLevel] || 0) + 1);
    };

    // 处理追加层级
    const handleAppend = () => {
      // 再次验证输入是否有效,防止按钮禁用状态下仍能触发
      if (!isValidInput() || !inputValue) return;
      const newKeys = [...selectedKeys, inputValue];
      setSelectedKeys(newKeys);
      onChange?.(newKeys.join('-'));
      setInputValue(null);
    };

    // 处理清空操作
    const handleClear = () => {
      setSelectedKeys([]);
      setInputValue(null);
      onChange?.('');
    };

    // 处理标签删除
    const handleTagClose = (index: number) => {
      const newKeys = selectedKeys.slice(0, index);
      setSelectedKeys(newKeys);
      onChange?.(newKeys.join('-'));
    };

    return (
      <div className="flex flex-col gap-2">
        {/* 当前标识预览 */}
        <div className="text-gray-600 text-sm">
          当前标识：{selectedKeys.length > 0 ? selectedKeys.join('-') : '请选择标识'}
        </div>
        
        {/* 标签展示区 */}
        <div className="flex flex-wrap gap-1">
          {selectedKeys.map((key, index) => (
            <Tag
              key={index}
              closable
              onClose={() => handleTagClose(index)}
              color="blue"
            >
              {`第${index + 1}层: ${key}`}
            </Tag>
          ))}
        </div>

        {/* 输入区域 */}
        <Space.Compact style={{ width: '100%' }}>
          <InputNumber
            style={{ width: '100%' }}
            value={inputValue}
            min={1}
            max={getMaxNumber(selectedKeys.length + 1)}
            placeholder={`请输入第${selectedKeys.length + 1}级标识 (1-${getMaxNumber(selectedKeys.length + 1)})`}
            onChange={(value) => setInputValue(value)}
            onPressEnter={() => {
              if (isValidInput()) {
                handleAppend();
              }
            }}
          />
          <Button 
            type="primary"
            onClick={handleAppend}
            disabled={!isValidInput()}
          >
            追加
          </Button>
          {selectedKeys.length > 0 && (
            <Button 
              danger
              onClick={handleClear}
            >
              清空
            </Button>
          )}
        </Space.Compact>
      </div>
    );
  };

  return (
    <Card>
      <Alert
        message="分类与知识库说明"
        description={
          <div>
            <p>• 每个分类只能绑定一个知识库，不能同时绑定多个知识库</p>
            <p>• AI 会根据用户提问的分类类型，匹配对应的知识库进行分析和回答</p>
            <p>• 请确保重要分类都已绑定对应的知识库，以保证 AI 能够准确回答相关问题</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <ProTable<Category>
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const { current, pageSize } = params;
          const res = await categoryApi.getCategories({
            page: current || 1,
            size: pageSize || 20,
          });
          
          return {
            data: res.data?.items || [],
            success: res.code === 0,
            total: res.data?.total || 0
          };
        }}
        toolbar={{
          title: '分类列表',
          actions: [
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              新建分类
            </Button>,
          ],
        }}
        rowKey="id"
        search={false}
      />

      <Modal
        title="新建分类"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="key"
            label="标识"
            rules={[{ required: true, message: '请选择分类标识' }]}
          >
            <LevelSelector />
          </Form.Item>
          <Form.Item
            name="sort_order"
            label="排序"
            rules={[{ required: true, message: '请选择排序' }]}
          >
            <Select>
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={30}>30</Select.Option>
              <Select.Option value={40}>40</Select.Option>
              <Select.Option value={50}>50</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑分类"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={handleUpdate}>
          <Form.Item
            name="knowledge_base_id"
            label="知识库"
            rules={[{ required: true, message: '请选择知识库' }]}
          >
            <Select>
              {knowledgeBases?.map(kb => (
                <Select.Option key={kb.id} value={kb.id}>
                  {kb.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="key"
            label="标识"
            rules={[{ required: true, message: '请选择分类标识' }]}
          >
            <LevelSelector />
          </Form.Item>
          <Form.Item
            name="sort_order"
            label="排序"
            rules={[{ required: true, message: '请选择排序' }]}
          >
            <Select>
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={30}>30</Select.Option>
              <Select.Option value={40}>40</Select.Option>
              <Select.Option value={50}>50</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CategoryList; 