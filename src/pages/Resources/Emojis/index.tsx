import { Card, Upload, Button, message, Modal, List, Image, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';

interface EmojiItem {
  id: number;
  url: string;
  name: string;
  createTime: string;
}

const Emojis = () => {
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchEmojis();
  }, []);

  const fetchEmojis = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch('/api/emojis');
      const data = await response.json();
      setEmojis(data);
    } catch (error) {
      message.error('获取表情包失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      // TODO: 替换为实际的上传 API
      await fetch('/api/emojis/upload', {
        method: 'POST',
        body: formData,
      });
      message.success('上传成功');
      fetchEmojis();
    } catch (error) {
      message.error('上传失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: 替换为实际的删除 API
      await fetch(`/api/emojis/${id}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      fetchEmojis();
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="表情包管理"
        extra={
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
          >
            <Button icon={<PlusOutlined />} type="primary">
              上传表情
            </Button>
          </Upload>
        }
      >
        <List
          grid={{ gutter: 16, column: 6 }}
          dataSource={emojis}
          loading={loading}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <Image
                    alt={item.name}
                    src={item.url}
                    preview={{
                      onVisibleChange: (visible) => {
                        setPreviewOpen(visible);
                        if (visible) {
                          setPreviewImage(item.url);
                        }
                      },
                    }}
                  />
                }
                actions={[
                  <Popconfirm
                    title="确定要删除这个表情包吗？"
                    onConfirm={() => handleDelete(item.id)}
                  >
                    <DeleteOutlined key="delete" />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta title={item.name} />
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Emojis; 