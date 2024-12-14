import { Card, Upload, Button, message, Modal, List, Image, Popconfirm, Input, Form, Select, Checkbox, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, FileImageOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { resourcesApi, ResourceType } from '../../../api/resources';
import styles from './index.module.less';

interface EmojiItem {
  id: number;
  path: string;
  type: ResourceType;
  description: string;
  status: string;
  created_at: string;
}

interface UploadFormValues {
  name: string;
  type: ResourceType;
  description: string;
}

// 定义文件类型常量
const STATIC_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml'
];

const ANIMATED_IMAGE_TYPES = [
  'image/gif',
  'image/webp', // 动态webp
  'image/apng', // 动态png
  'image/jfif' // 动态jfif
];

// 添加搜索表单的类型定义
interface SearchFormValues {
  resource_type?: ResourceType;
  resource_name?: string;
  status?: string;
  keyword?: string;
}

const Emojis = () => {
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [form] = Form.useForm();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0
  });
  const [fileList, setFileList] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<SearchFormValues>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [currentEmoji, setCurrentEmoji] = useState<EmojiItem | null>(null);

  useEffect(() => {
    fetchEmojis(searchParams);
  }, [pagination.current, pagination.pageSize, searchParams]);

  const fetchEmojis = async (params: SearchFormValues = {}) => {
    setLoading(true);
    try {
      console.log(pagination.current, pagination.pageSize);
      const { data } = await resourcesApi.getResources({ 
        page: pagination.current,
        size: pagination.pageSize,
        resource_type: params.resource_type,
        resource_name: params.resource_name,
        status: params.status
      });
      setEmojis(data.items);
      setPagination(prev => ({
        ...prev,
        total: data.total
      }));
    } catch (error) {
      message.error('获取表情包失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建一个清理函数
  const cleanupUploadModal = () => {
    // 清理文件列表
    setUploadFiles([]);
    setFileList([]);
    
    // 清理所有预览URL
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    
    // 重置表单
    form.resetFields();
    
    // 关闭弹窗
    setUploadModalVisible(false);
  };

  const handleUpload = async (values: UploadFormValues) => {
    if (!uploadFiles.length) {
      message.error('请选择要上传的图片');
      return;
    }

      try {
        // 上传所有文件
        const uploadPromises = uploadFiles.map(file => resourcesApi.uploadFile(file));
        const uploadResults = await Promise.all(uploadPromises);

        // 创建表情包记录
        const createPromises = uploadResults.map(result => {
          const url = result.data.url;
          // 根据URL后缀判断类型
          const isAnimated = url.toLowerCase().match(/\.(gif|webp|apng)$/);
          const type = isAnimated ? ResourceType.GIF : ResourceType.IMAGE;
          
          return resourcesApi.addSticker({
            url: url,
            description: values.description,
            type: type
          });
        });

        await Promise.all(createPromises);
        message.success('上传成功');
        
        // 使用统一的清理函数
        cleanupUploadModal();
        
        // 刷新列表
        fetchEmojis();
      } catch (error) {
        message.error('上传失败');
      }
  };

  const handleDelete = async (id: number) => {
    try {
      await resourcesApi.deleteResource(id);
      message.success('删除成功');
      fetchEmojis();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 修改文件处理函数
  const handleUploadChange = (info: any) => {
    // 更新 Upload 组件的文件列表
    setFileList(info.fileList);
    
    // 如果是清空操作，直接返回
    if (info.fileList.length === 0) {
      setUploadFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      return;
    }
    
    const newFiles = info.fileList
      .filter((f: any) => f.originFileObj)
      .map((f: any) => f.originFileObj);
    
    // 文件大小校验
    const oversizeFiles = newFiles.filter(file => file.size / 1024 / 1024 > 2);
    if (oversizeFiles.length > 0) {
      message.error(`有 ${oversizeFiles.length} 个文件超过2MB限制`);
      // 清理所有状态
      setFileList([]);
      setUploadFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      return;
    }

    // 类型校验
    const validation = validateFileType(newFiles);
    if (!validation.valid) {
      message.error(validation.message);
      // 清理所有状态
      setFileList([]);
      setUploadFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      // setPreviewUrls([]);
      return;
    }

    // 通过校验，更新文件列表和预览
    setUploadFiles(newFiles);
    
    // 清除旧的预览URL
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // 创建新的预览URL
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
    
    // 设置表单类型
    form.setFieldValue('type', validation.type);
  };

  // 修改类型校验函数
  const validateFileType = (files: File[]) => {
    // 重置当前选择的类型
    const currentType = form.getFieldValue('type');
    
    if (!files.length) return { valid: false, type: currentType, message: '请选择文件' };

    // 检查所有文件的类型
    const fileTypes = files.map(file => {
      const isStaticImage = STATIC_IMAGE_TYPES.includes(file.type);
      const isAnimatedImage = ANIMATED_IMAGE_TYPES.includes(file.type);
      return { file, isStaticImage, isAnimatedImage };
    });

    // 检查是否存在不支持的文件类型
    const invalidFiles = fileTypes.filter(
      ({ isStaticImage, isAnimatedImage }) => !isStaticImage && !isAnimatedImage
    );
    if (invalidFiles.length > 0) {
      return {
        valid: false,
        type: currentType,
        message: `存在 ${invalidFiles.length} 个不支的文件格式`
      };
    }

    // 检查是否混合了静态图和动态图
    const hasStaticImages = fileTypes.some(({ isStaticImage }) => isStaticImage);
    const hasAnimatedImages = fileTypes.some(({ isAnimatedImage }) => isAnimatedImage);
    
    if (hasStaticImages && hasAnimatedImages) {
      return {
        valid: false,
        type: currentType,
        message: '不能同时上传静态图片和动态图片'
      };
    }

    // 确定文件类型
    const type = hasAnimatedImages ? ResourceType.GIF : ResourceType.IMAGE;
    return { valid: true, type, message: '' };
  };

  const handleBatchDelete = async () => {
    if (!selectedIds.length) {
      message.warning('请选择要删除的表情包');
      return;
    }

    try {
      await Promise.all(selectedIds.map(id => resourcesApi.deleteResource(id)));
      message.success('批量删除成功');
      setSelectedIds([]);
      setSelectMode(false);
      fetchEmojis();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // 添加全选/取消全选功能
  const toggleSelectAll = () => {
    if (selectedIds.length === emojis.length) {
      // 如果已经全选，则取消全选
      setSelectedIds([]);
    } else {
      // 否则全选
      setSelectedIds(emojis.map(item => item.id));
    }
  };

  // 修改搜索处理函数
  const handleSearch = async (values: SearchFormValues) => {
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
    setSearchParams(values);
  };

  // 修改分页处理函数
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  // 添加处理编辑的函数
  const handleEdit = (item: EmojiItem) => {
    setCurrentEmoji(item);
    editForm.setFieldsValue({
      type: item.type,
      name: item.name,
      description: item.description
    });
    setEditModalVisible(true);
  };

  // 添加保存编辑的函数
  const handleEditSave = async (values: { name: string; description: string; type: ResourceType }) => {
    if (!currentEmoji) return;
    
    try {
      await resourcesApi.updateResource(currentEmoji.id, {
        name: values.name,
        description: values.description,
        type: values.type
      });
      message.success('更新成功');
      setEditModalVisible(false);
      fetchEmojis(searchParams);
    } catch (error) {
      message.error('更新失败');
    }
  };

  return (
    <div className={styles.emojiManager}>
      <Card className={styles.emojiManagerCard}>
        {/* 添加搜索表单 */}
        <Space style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', marginBottom: '32px' }}>
          <Form
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
            className={styles.searchForm}
          >
            <Form.Item name="resource_type" label="类型">
              <Select style={{ width: 120 }} allowClear>
                <Select.Option value={ResourceType.IMAGE}>静态图片</Select.Option>
                <Select.Option value={ResourceType.GIF}>动态图片</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="状态">
              <Select style={{ width: 120 }} allowClear>
                <Select.Option value="active">启用</Select.Option>
                <Select.Option value="inactive">禁用</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="keyword" label="关键词">
              <Input placeholder="搜索表情描述" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
                <Button onClick={() => {
                  searchForm.resetFields();
                  handleSearch({});
                }}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileImageOutlined />
              <span>表情包管理</span>
              {selectMode && (
                <span className={styles.selectedCount}>
                  (已选择 {selectedIds.length} 项)
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectMode && (
                <>
                  <Checkbox
                    checked={selectedIds.length === emojis.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < emojis.length}
                    onChange={toggleSelectAll}
                  >
                    全选
                  </Checkbox>
                  <Popconfirm
                    title={`确定要删除选中的 ${selectedIds.length} 个表情包吗？`}
                    okText="确定"
                    cancelText="取消"
                    onConfirm={handleBatchDelete}
                    disabled={!selectedIds.length}
                  >
                    <Button 
                      danger 
                      icon={<DeleteOutlined />}
                      disabled={!selectedIds.length}
                    >
                      批量删除
                    </Button>
                  </Popconfirm>
                </>
              )}
              <Button 
                onClick={() => {
                  setSelectMode(!selectMode);
                  setSelectedIds([]);
                }}
              >
                {selectMode ? '取消选择' : '批量操作'}
              </Button>
              <Button 
                icon={<PlusOutlined />} 
                type="primary"
                onClick={() => setUploadModalVisible(true)}
              >
                上传表情
              </Button>
            </div>
          </div>
        </Space>

        {/* 修改表情包列表样式 */}
        <List
          grid={{ gutter: 16, column: 5 }}
          dataSource={emojis}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: handlePageChange,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30', '50', '100'],
            showQuickJumper: true,
            showTotal: total => `共 ${total} 项`
          }}
          renderItem={(item) => (
            <List.Item>
              <div className={styles.emojiCard}>
                <div className={styles.emojiContent}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', marginRight: 6 }}
                      alt={item.description}
                      src={item.path}
                    />
                    <div className={styles.emojiInfo}>
                      <div className={styles.emojiDescription}>
                        {item.description || '无'}
                      </div>
                      <div className={styles.emojiMeta}>
                        <span>{item.type === ResourceType.GIF ? '动态图' : '图片(静态)'} {item.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.emojiActions}>
                    {selectMode ? (
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    ) : (
                      <Space>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(item)}
                        />
                        <Popconfirm
                          title="确定要删除这个表情包吗？"
                          onConfirm={() => handleDelete(item.id)}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Space>
                    )}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="上传表情包"
        open={uploadModalVisible}
        onCancel={cleanupUploadModal}
        afterClose={cleanupUploadModal}
        footer={null}
        width={900}
      >
        <div className={styles.uploadContent}>
          <div className={styles.uploadLeft} style={{ flex: 3 }}>
            <Upload.Dragger
              accept="image/*"
              multiple
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUploadChange}
              fileList={fileList}
              className={styles.uploadDragger}
            >
              <div className={styles.uploadIcon}>
                <FileImageOutlined />
              </div>
              <div className={styles.uploadText}>点击或拖拽图片到此处上传</div>
            </Upload.Dragger>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, 100px)', 
              gap: '8px' 
            }}>
              {previewUrls.map((url, index) => (
                <div key={url} style={{
                  position: 'relative',
                  width: '100px',
                  height: '100px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '2px',
                  margin: '8px auto 16px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={url} 
                    alt={`preview-${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                  <DeleteOutlined 
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      padding: '4px',
                      background: 'rgba(0, 0, 0, 0.45)',
                      color: '#fff',
                      borderRadius: '50%',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const newFiles = uploadFiles.filter((_, i) => i !== index);
                      setUploadFiles(newFiles);
                      URL.revokeObjectURL(url);
                      setPreviewUrls(previewUrls.filter((_, i) => i !== index));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.uploadRight} style={{ flex: 2 }}>
            <Form 
              form={form} 
              onFinish={handleUpload}
              layout="vertical"
              initialValues={{ type: ResourceType.IMAGE }}
            >
              <Form.Item
                name="type"
                label="表情类型"
                rules={[{ required: true, message: '请选择表情类型' }]}
              >
                <Select 
                  placeholder="请选择表情类型"
                  onChange={(newType: ResourceType) => {
                    if (uploadFiles.length > 0) {
                      message.warning('请先清空已选图片后再切换类型');
                      // 将类型选择恢复到原来的值
                      form.setFieldValue('type', form.getFieldValue('type'));
                      return;
                    }

                    // 清空已选文件
                    setUploadFiles([]);
                    previewUrls.forEach(url => URL.revokeObjectURL(url));
                    setPreviewUrls([]);
                  }}
                >
                  <Select.Option value={ResourceType.IMAGE}>图片</Select.Option>
                  <Select.Option value={ResourceType.GIF}>动图</Select.Option>
                </Select>
              </Form.Item>

              {/* <Form.Item
                name="name"
                label="表情名称"
                rules={[{ required: true, message: '请输入表情名称' }]}
              >
                <Input placeholder="请输入表情名称" />
              </Form.Item> */}

              <Form.Item
                name="description"
                label="描述"
              >
                <Input.TextArea 
                  placeholder="请输入表情描述（选填）" 
                  rows={3}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  disabled={!uploadFiles.length}
                >
                  上传
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>

      {/* 添加编辑模态框 */}
      <Modal
        title="编辑表情包"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentEmoji(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editForm}
          onFinish={handleEditSave}
          layout="vertical"
          initialValues={{
            type: currentEmoji?.type,
            name: currentEmoji?.name,
            description: currentEmoji?.description
          }}
        >
          <div style={{ display: 'flex', marginBottom: 24 }}>
            <Image
              width={100}
              height={100}
              style={{ objectFit: 'contain' }}
              src={currentEmoji?.path}
              alt={currentEmoji?.description}
            />
            <div style={{ marginLeft: 16 }}>
              <div>创建时间：{currentEmoji?.created_at}</div>
            </div>
          </div>

          <Form.Item
            name="type"
            label="表情类型"
            rules={[{ required: true, message: '请选择表情类型' }]}
          >
            <Select placeholder="请选择表情类型">
              <Select.Option value={ResourceType.IMAGE}>静态图</Select.Option>
              <Select.Option value={ResourceType.GIF}>动态图</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="表情名称"
            rules={[{ required: true, message: '请输入表情名称' }]}
          >
            <Input placeholder="请输入表情名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              placeholder="请输入表情描述（选填）"
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Emojis; 