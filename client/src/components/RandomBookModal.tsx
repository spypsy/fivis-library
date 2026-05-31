import { Button, Card, Empty, Image, Modal, Radio, Select, Space, Tag as AntTag, Typography, message } from 'antd';
import useAxios from 'axios-hooks';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RandomBookRecommendation, Tag, TagOperator } from 'types';

type RandomBookModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
};

const RandomBookModal = ({ isOpen, onClose, tags }: RandomBookModalProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagOperator, setTagOperator] = useState<TagOperator>('and');
  const [recommendation, setRecommendation] = useState<RandomBookRecommendation>();
  const [{ loading }, getRandomBook] = useAxios<RandomBookRecommendation>(
    { url: '/api/books/random-recommendation', method: 'POST' },
    { manual: true },
  );

  useEffect(() => {
    if (!isOpen) {
      setRecommendation(undefined);
    }
  }, [isOpen]);

  const handleRecommend = async () => {
    try {
      const { data } = await getRandomBook({
        data: {
          tags: selectedTags,
          tagOperator,
        },
      });
      setRecommendation(data);
    } catch {
      message.error('Could not get a random book recommendation');
    }
  };

  const book = recommendation?.book;

  return (
    <Modal
      title="Random book recommendation"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="recommend" type="primary" onClick={handleRecommend} loading={loading}>
          Recommend a book
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Select
          mode="multiple"
          allowClear
          placeholder="Choose tags"
          value={selectedTags}
          onChange={setSelectedTags}
          options={tags.map(tag => ({ value: tag.name, label: tag.name }))}
          style={{ width: '100%' }}
        />
        <Radio.Group
          value={tagOperator}
          onChange={event => setTagOperator(event.target.value)}
          optionType="button"
          options={[
            { value: 'and', label: 'AND' },
            { value: 'or', label: 'OR' },
          ]}
        />
        <Typography.Text type="secondary">Leave tags empty to choose from your full library.</Typography.Text>

        {recommendation?.totalMatches === 0 && (
          <Empty description={selectedTags.length ? 'No books match those tags. Try fewer tags or OR.' : 'No books in your library yet.'} />
        )}

        {book && (
          <Card>
            <Space align="start">
              {book.imageLink && <Image src={book.imageLink} alt={book.title} width={72} preview={false} />}
              <Space direction="vertical" size="small">
                <Link to={`/book/${book.isbn}`} onClick={onClose}>
                  <Typography.Title level={4} style={{ marginBottom: 0 }}>
                    {book.title || 'Untitled'}
                  </Typography.Title>
                </Link>
                {!!book.authors?.length && <Typography.Text>{book.authors.map(author => author.name).join(', ')}</Typography.Text>}
                {!!book.tags?.length && (
                  <Space wrap size={[0, 4]}>
                    {book.tags.map(tag => (
                      <AntTag key={tag.name}>{tag.name}</AntTag>
                    ))}
                  </Space>
                )}
                <Typography.Text type="secondary">{recommendation.totalMatches} matching book(s)</Typography.Text>
              </Space>
            </Space>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default RandomBookModal;
