import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Image,
  Input,
  Rate,
  Row,
  Select,
  Skeleton,
  Tag,
  Typography,
  message,
} from 'antd';
import useAxios from 'axios-hooks';
import { languages } from 'countries-list';
import isEqual from 'lodash.isequal';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tag as TagType, UserBook } from 'types';

const { Paragraph } = Typography;

export const Book = () => {
  const { isbn } = useParams<{ isbn: string }>();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [bookData, editBookData] = useState<UserBook>();
  const [{ data: tagsData }] = useAxios<TagType[]>('/api/tags', { useCache: false });

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
      data: { bookData },
    },
    { manual: true },
  );

  useEffect(() => {
    if (fetchBookData && !bookData) {
      editBookData(fetchBookData);
    }
  }, [fetchBookData, bookData]);

  const onSave = async () => {
    setEditMode(false);
    if (!isEqual(fetchBookData, bookData)) {
      const result = await saveBook();
      if (result.status !== 200) {
        message.error('Error saving book');
        editBookData(fetchBookData);
      } else {
        message.success('Book saved');
      }
    }
  };

  return (
    <>
      <Row>
        <Col span={4} />
        <Col span={16}>
          <Skeleton loading={!!loading || !!saveLoading}>
            <Descriptions
              bordered
              column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
              title={
                <>
                  {fetchBookData?.imageLink && <Image loading="eager" src={fetchBookData.imageLink}></Image>}
                  <span style={{ marginLeft: '1rem' }}>{fetchBookData?.title}</span>
                </>
              }
              extra={
                <>
                  {editMode && (
                    <Button
                      type="default"
                      onClick={() => {
                        setEditMode(false);
                        editBookData(fetchBookData);
                      }}
                      style={{ marginRight: '1rem' }}
                    >
                      Cancel
                    </Button>
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
                </>
              }
            >
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

              <Descriptions.Item label="Originally Published">
                {editMode ? (
                  <DatePicker
                    picker="year"
                    onChange={e => editBookData({ ...bookData!, originalPublishedYear: e?.year() })}
                    value={bookData!.originalPublishedYear! ? moment().year(bookData!.originalPublishedYear) : null}
                  />
                ) : (
                  bookData?.originalPublishedYear
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Description">
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                  {fetchBookData?.description}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Language">
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                  {fetchBookData?.language ? languages[fetchBookData?.language].name : ''}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Original Language">
                {editMode ? (
                  <Select
                    options={Object.entries(languages).map(([key, value]) => ({
                      value: key,
                      label: value.name,
                    }))}
                    value={bookData?.originalLanguage}
                    onChange={val => editBookData({ ...bookData!, originalLanguage: val })}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                    {bookData?.originalLanguage ? languages[bookData.originalLanguage].name : ''}
                  </Paragraph>
                )}
              </Descriptions.Item>
              {fetchBookData?.addedAt && (
                <Descriptions.Item label="Added At">
                  {new Date(fetchBookData?.addedAt).toLocaleDateString('en-gb', {
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
                        tags: val.map(tag => tagsData?.find(t => t.name === tag) || { name: tag }),
                      })
                    }
                    style={{ width: '100%' }}
                    value={bookData?.tags?.map(tag => tag.name)}
                  >
                    {tagsData?.map(tag => (
                      <Select.Option key={`${tag.name}.${tag.id}`} value={tag.name}>
                        {tag.name}
                      </Select.Option>
                    ))}
                  </Select>
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
          </Skeleton>
        </Col>
      </Row>
    </>
  );
};
