import { useState, useEffect } from 'react';
import { Card, Table, Button, Image, Switch, message, Modal, Form, Input, Upload } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { resourcesApi, Resource, ResourceName, ResourceStatus } from '../../../api/resources';
import styles from './index.module.less';

const Banners = () => {
  const [banners, setBanners] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [hasUploadedImage, setHasUploadedImage] = useState(false);

  // 获取轮播图列表
  const fetchBanners = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const { code, data } = await resourcesApi.getResources({
        page,
        size,
        resource_name: ResourceName.BANNER,
      });
      if (code === 0 && data) {
        setBanners(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      message.error('获取轮播图列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理状态变更
  const handleStatusChange = async (id: number, status: boolean) => {
    try {
      const { code } = await resourcesApi.updateResource(id, {
        status: status ? ResourceStatus.ACTIVE : ResourceStatus.INACTIVE,
      });
      if (code === 0) {
        message.success('更新状态成功');
        fetchBanners();
      }
    } catch (error) {
      message.error('更新状态失败');
    }
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个轮播图吗？',
      onOk: async () => {
        try {
          const { code } = await resourcesApi.deleteResource(id);
          if (code === 0) {
            message.success('删除成功');
            setCurrentPage(1);
            await fetchBanners(1, pageSize);
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 删除上传的文件
  const handleDeleteFile = async (url: string) => {
    try {
      const { code } = await resourcesApi.deleteFile(url);
      if (code === 0) {
        form.setFieldsValue({ file: null, path: null, preview: null });
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
    }
  };

  // 修改上传处理
  const uploadProps = {
    listType: 'picture-card',
    maxCount: 1,
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        setUploadLoading(true);
        const { code, data } = await resourcesApi.uploadFile(file);
        if (code === 0 && data) {
          const previousUrl = form.getFieldValue('path');
          if (previousUrl) {
            await handleDeleteFile(previousUrl);
          }
          form.setFieldsValue({
            path: data.url,
            preview: data.url
          });
          setHasUploadedImage(true);
          message.success('上传成功');
        }
      } catch (error) {
        message.error('上传失败');
      } finally {
        setUploadLoading(false);
      }
      return false;
    }
  };

  // 修改预览图片处理
  const handlePreview = () => {
    const previewUrl = form.getFieldValue('preview');
    if (previewUrl) {
      setPreviewImage(previewUrl);
      setPreviewVisible(true);
    }
  };

  // 修改表单提交处理
  const handleSubmit = async (values: any) => {
    try {
      const { description, path } = values;
      if (!path) {
        message.error('请上传图片');
        return;
      }

      const { code } = await resourcesApi.addBanner({
        url: path,
        description,
      });
      
      if (code === 0) {
        message.success('添加成功');
        setModalVisible(false);
        fetchBanners();
        form.resetFields();
      } else {
        // 如果添加失败，删除已上传的文件
        await handleDeleteFile(path);
        form.resetFields();
      }
    } catch (error) {
      // 如果发生错误，也删除已上传的文件
      const path = form.getFieldValue('path');
      if (path) {
        await handleDeleteFile(path);
      }
      message.error('添加失败');
    }
  };

  // 修改弹窗关闭处理
  const handleModalClose = async () => {
    const url = form.getFieldValue('path');
    if (url) {
      await handleDeleteFile(url);
    }
    form.resetFields();
    setHasUploadedImage(false);
    setModalVisible(false);
  };

  // 修改预览删除处理
  const handlePreviewDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = form.getFieldValue('path');
    if (url) {
      try {
        const { code } = await resourcesApi.deleteFile(url);
        if (code === 0) {
          form.setFieldsValue({
            file: undefined,
            path: undefined,
            preview: undefined
          });
          setHasUploadedImage(false);
          form.validateFields(['file']);
        }
      } catch (error) {
        message.error('删除文件失败');
      }
    }
  };

  const columns = [
    {
      title: '预览图',
      dataIndex: 'path',
      width: 200,
      render: (path: string) => <Image src={path} width={180} />,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string, record: Resource) => (
        <Switch
          checked={status === ResourceStatus.ACTIVE}
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 120,
      render: (_: any, record: Resource) => (
        <Button type="link" danger onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className={styles.banners}>
      <Card
        title="轮播图管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setModalVisible(true);
            }}
          >
            添加轮播图
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={banners}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              fetchBanners(page, size);
            },
          }}
        />
      </Card>

      <Modal
        title="添加轮播图"
        open={modalVisible}
        onOk={form.submit}
        onCancel={handleModalClose}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="图片"
            name="file"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <div className={styles.uploadContainer}>
              {hasUploadedImage ? (
                <div className={styles.previewContainer}>
                  <img 
                    src={form.getFieldValue('preview')} 
                    alt="preview"
                    onClick={handlePreview}
                    style={{ width: '200px', height: '100%' }}
                    className={styles.previewImage}
                  />
                  <Button 
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={handlePreviewDelete}
                    className={styles.deleteBtn}
                  />
                </div>
              ) : (
                <Upload {...uploadProps}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>点击上传</div>
                  </div>
                </Upload>
              )}
            </div>
          </Form.Item>
          <Form.Item name="path" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img 
          alt="预览图片" 
          src={previewImage} 
          style={{ width: '100%' }} 
        />
      </Modal>
    </div>
  );
};

export default Banners; 