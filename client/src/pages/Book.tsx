import {
  Button,
  DatePicker,
  Descriptions,
  Image,
  Input,
  Popconfirm,
  Rate,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import useAxios from 'axios-hooks';
import PageShell from 'components/PageShell';
import { languages } from 'countries-list';
import { useTags } from 'hooks/useTags';
import dayjs from 'dayjs';
import isEqual from 'lodash.isequal';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { UserBook } from 'types';

const { Paragraph } = Typography;

const languageOptions = Object.entries(languages)
  .sort((a, b) => a[1].name.localeCompare(b[1].name))
  .map(([key, value]) => ({
    value: key,
    label: value.name,
  }));

export const Book = () => {
  const history = useHistory();
  const { isbn } = useParams<{ isbn: string }>();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [bookData, editBookData] = useState<UserBook>();
  const { tags: tagsData } = useTags();

  const [{ data: fetchBookData, loading }] = useAxios<UserBook>(
    {
      url: `/api/books/${isbn}`,
    },
    { useCache: false },
  );
  const [{ loading: saveLoading }, saveBook] = useAxios<UserBook>(
    {
      url: `/api/books/${isbn}`,
      method: 'PUT',
    },
    { manual: true },
  );
  const [, deleteBook] = useAxios(
    {
      url: `/api/books/${isbn}`,
      method: 'DELETE',
      data: { isbn },
    },
    { manual: true },
  );

  useEffect(() => {
    if (fetchBookData) {
      editBookData(fetchBookData);
    }
  }, [fetchBookData]);

  const onSave = async () => {
    setEditMode(false);
    if (!isEqual(fetchBookData, bookData)) {
      const result = await saveBook({ data: { bookData } });
      if (result.status !== 200) {
        message.error('Error saving book');
        editBookData(fetchBookData);
      } else {
        message.success('Book saved');
      }
    }
  };

  const onDelete = async () => {
    const result = await deleteBook();
    if (result.status !== 200) {
      message.error('Error deleting book');
    } else {
      history.push('/my-books');
      message.success('Book deleted');
    }
  };

  const actions = (
    <Space wrap>
      {editMode && (
        <>
          <Popconfirm title="Remove this book from your library?" onConfirm={onDelete} okText="Delete" okButtonProps={{ danger: true }}>
            <Button danger>Delete</Button>
          </Popconfirm>
          <Button
            onClick={() => {
              setEditMode(false);
              editBookData(fetchBookData);
            }}
          >
            Cancel
          </Button>
        </>
      )}
      <Button
        type={editMode ? 'primary' : 'default'}
        onClick={() => {
          if (editMode) {
            onSave();
          } else {
            setEditMode(true);
          }
        }}
      >
        {editMode ? 'Save' : 'Edit'}
      </Button>
    </Space>
  );

  return (
    <PageShell title={fetchBookData?.title || 'Book'} extra={actions}>
      <Skeleton loading={!!loading || !!saveLoading} active>
        <div className="book-detail-layout">
          <div className="book-detail-cover">
            {fetchBookData?.imageLink && (
              <Image loading="eager" src={fetchBookData.imageLink} alt={fetchBookData.title} />
            )}
            {bookData?.rating != null && bookData.rating > 0 && (
              <div style={{ marginTop: 12 }}>
                <Rate allowHalf value={bookData.rating} disabled={!editMode} onChange={rating => editBookData({ ...bookData!, rating })} />
              </div>
            )}
          </div>
          <div className="book-detail-meta">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Subtitle">
                {editMode ? (
                  <Input
                    placeholder="Subtitle"
                    value={bookData?.subtitle}
                    onChange={e => editBookData({ ...bookData!, subtitle: e.target.value })}
                  />
                ) : (
                  bookData?.subtitle
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Authors">
                {bookData?.authors?.map(author => author.name).join(', ')}
              </Descriptions.Item>
              <Descriptions.Item label="Publisher">
                {editMode ? (
                  <Input
                    value={bookData?.publisher}
                    onChange={e => editBookData({ ...bookData!, publisher: e.target.value })}
                  />
                ) : (
                  bookData?.publisher
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Published">
                {bookData?.publishedDate
                  ? new Date(bookData?.publishedDate).toLocaleDateString('en-gb', {
                      year: 'numeric',
                    })
                  : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Originally published">
                {editMode ? (
                  <DatePicker
                    picker="year"
                    onChange={e => editBookData({ ...bookData!, originalPublishedYear: e?.year() })}
                    value={
                      bookData?.originalPublishedYear
                        ? dayjs().year(bookData.originalPublishedYear)
                        : undefined
                    }
                  />
                ) : (
                  bookData?.originalPublishedYear
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {editMode ? (
                  <Input.TextArea
                    rows={4}
                    value={bookData?.description}
                    onChange={e => editBookData({ ...bookData!, description: e.target.value })}
                  />
                ) : (
                  <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
                    {bookData?.description}
                  </Paragraph>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Language">
                {bookData?.language ? languages[bookData.language]?.name : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Original language">
                {editMode ? (
                  <Select
                    showSearch
                    options={languageOptions}
                    value={bookData?.originalLanguage}
                    onChange={val => editBookData({ ...bookData!, originalLanguage: val })}
                    style={{ width: '100%' }}
                    filterOption={(value, option) =>
                      (option?.label ?? '').toLowerCase().startsWith(value.toLowerCase())
                    }
                  />
                ) : (
                  bookData?.originalLanguage ? languages[bookData.originalLanguage]?.name : ''
                )}
              </Descriptions.Item>
              {fetchBookData?.addedAt && (
                <Descriptions.Item label="Added">
                  {new Date(fetchBookData.addedAt).toLocaleDateString('en-gb', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tags">
                {editMode ? (
                  <Select
                    mode="tags"
                    onChange={val =>
                      editBookData({
                        ...bookData!,
                        tags: val.map((tag: string) => tagsData?.find(t => t.name === tag) || { name: tag }),
                      })
                    }
                    style={{ width: '100%' }}
                    value={bookData?.tags?.map(tag => tag.name)}
                    options={tagsData?.map(tag => ({ value: tag.name, label: tag.name }))}
                  />
                ) : (
                  bookData?.tags?.map(tag => <Tag key={tag.name}>{tag.name}</Tag>)
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Comment">
                {editMode ? (
                  <Input.TextArea
                    rows={4}
                    value={bookData?.comment}
                    onChange={e => editBookData({ ...bookData!, comment: e.target.value })}
                  />
                ) : (
                  <p className="comment-value">{bookData?.comment}</p>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <Rate
                  allowHalf
                  value={bookData?.rating}
                  disabled={!editMode}
                  onChange={rating => editBookData({ ...bookData!, rating })}
                />
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Skeleton>
    </PageShell>
  );
};
