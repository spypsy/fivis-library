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
  const [editData, setEditData] = useState<UserBook>();
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
  const [{ data: tagsData }] = useAxios<TagType[]>('/api/tags', { useCache: false });

  const [{ data: bookData, loading }, loadBook] = useAxios<UserBook>({
    url: `/api/books/${isbn}`,
  });
  const [{ loading: saveLoading }, saveBook] = useAxios<UserBook>(
    {
      url: `/api/books/${isbn}`,
      method: 'PUT',
      data: { bookData: editData },
    },
    { manual: true },
  );

  useEffect(() => {
    if (bookData && !editData) {
      setEditData(bookData);
    }
  }, [bookData, editData]);

  useEffect(() => {
    if (shouldUpdate) {
      loadBook();
      setShouldUpdate(false);
    }
  }, [shouldUpdate, loadBook]);

  const onSave = async () => {
    setEditMode(false);
    if (!isEqual(bookData, editData)) {
      await saveBook();
      setShouldUpdate(true);
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
                  {bookData?.imageLink && <Image loading="eager" src={bookData.imageLink}></Image>}
                  <span style={{ marginLeft: '1rem' }}>{bookData?.title}</span>
                </>
              }
              extra={
                <>
                  {editMode && (
                    <Button
                      type="default"
                      onClick={() => {
                        setEditMode(false);
                        setEditData(bookData);
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
              <Descriptions.Item label="Authors">
                {bookData?.authors?.map(author => author.name).join(', ')}
              </Descriptions.Item>

              <Descriptions.Item label="Publisher">
                {editMode ? (
                  <Input
                    value={editData?.publisher}
                    onChange={e => setEditData({ ...editData!, publisher: e.target.value })}
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
                    onChange={e => setEditData({ ...editData!, originalPublishedYear: e?.year() })}
                    value={editData!.originalPublishedYear! ? moment().year(editData!.originalPublishedYear) : null}
                  />
                ) : (
                  bookData?.originalPublishedYear
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Subtitle">
                {editMode ? (
                  <Input
                    placeholder="Subtitle"
                    value={editData?.subtitle}
                    onChange={e => setEditData({ ...editData!, subtitle: e.target.value })}
                  />
                ) : (
                  editData?.subtitle
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{bookData?.description}</Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Language">
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                  {bookData?.language ? languages[bookData?.language].name : ''}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Original Language">
                {editMode ? (
                  <Select
                    options={Object.entries(languages).map(([key, value]) => ({
                      value: key,
                      label: value.name,
                    }))}
                    value={editData?.originalLanguage}
                    onChange={val => setEditData({ ...editData!, originalLanguage: val })}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                    {bookData?.originalLanguage ? languages[bookData?.originalLanguage].name : ''}
                  </Paragraph>
                )}
              </Descriptions.Item>
              {bookData?.addedAt && (
                <Descriptions.Item label="Added At">
                  {new Date(bookData?.addedAt).toLocaleDateString('en-gb', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tags">
                {editMode ? (
                  <Select
                    options={tagsData?.map(tag => ({ label: tag.name, value: tag.name }))}
                    mode="tags"
                    onChange={val =>
                      setEditData({
                        ...editData!,
                        tags: val.map(tag => tagsData?.find(t => t.name === tag) || { name: tag }),
                      })
                    }
                    style={{ width: '100%' }}
                    value={editData?.tags?.map(tag => tag.name)}
                  />
                ) : (
                  bookData?.tags?.map(tag => <Tag key={tag.name}>{tag.name}</Tag>)
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Comment">
                {editMode ? (
                  <Input.TextArea
                    rows={4}
                    value={editData?.comment}
                    onChange={e => setEditData({ ...editData!, comment: e.target.value })}
                  />
                ) : (
                  <p className="comment-value">{bookData?.comment}</p>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <Rate
                  allowHalf
                  value={editData?.rating}
                  disabled={!editMode}
                  onChange={rating => setEditData({ ...editData!, rating })}
                />
              </Descriptions.Item>
            </Descriptions>
          </Skeleton>
        </Col>
      </Row>
    </>
  );
};
