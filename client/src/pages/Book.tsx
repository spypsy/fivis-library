import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Descriptions, Image, Input, Row, Skeleton, Typography } from 'antd';
import useAxios from 'axios-hooks';
import { languages } from 'countries-list';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserBook } from 'types';

const { Paragraph } = Typography;

type EditFlags = {
  comment: boolean;
};

export const Book = () => {
  const { isbn } = useParams<{ isbn: string }>();
  const [editMode, setEditMode] = useState<EditFlags>();

  const [{ data: bookData, loading }] = useAxios<UserBook>({
    url: `/api/books/${isbn}`,
  });

  console.log(bookData);

  return (
    <Row>
      <Col span={4} />
      <Col span={16}>
        <Skeleton loading={loading}>
          <Descriptions
            bordered
            column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
            title={
              <>
                <Image src={bookData?.imageLink}></Image>
                {bookData?.title}
              </>
            }
          >
            <Descriptions.Item label="Authors">
              {bookData?.authors?.map(author => <span key={author.name}>{author.name}</span>)}
            </Descriptions.Item>

            <Descriptions.Item label="Publisher">{bookData?.publisher}</Descriptions.Item>

            {bookData?.publishedDate && (
              <Descriptions.Item label="Published Date">
                {new Date(bookData?.publishedDate).toLocaleDateString('en-gb', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Descriptions.Item>
            )}

            {bookData?.originalPublishedYear && (
              <Descriptions.Item label="Original Published Year">{bookData?.originalPublishedYear}</Descriptions.Item>
            )}
            {bookData?.description && (
              <Descriptions.Item label="Description">
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{bookData.description}</Paragraph>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Language">
              <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                {bookData?.language ? languages[bookData?.language].name : ''}
              </Paragraph>
            </Descriptions.Item>
            {bookData?.originalLanguage && (
              <Descriptions.Item label="Original Language">
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                  {bookData?.originalLanguage ? languages[bookData?.originalLanguage].name : ''}
                </Paragraph>
              </Descriptions.Item>
            )}
            {bookData?.addedAt && (
              <Descriptions.Item label="Added At">
                {new Date(bookData?.addedAt).toLocaleDateString('en-gb', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Comment">
              {editMode?.comment ? <Input.TextArea rows={4} value={bookData?.comment} /> : editMode?.comment}
              {bookData?.comment && <p className="comment-value">{bookData.comment}</p>}
              {/* <Button
                type="primary"
                shape="circle"
                icon={editMode?.comment ? <SaveOutlined /> : <EditOutlined />}
                size="middle"
                onClick={() =>
                  setEditMode(state => ({
                    ...state,
                    comment: !state?.comment,
                  }))
                }
              /> */}
            </Descriptions.Item>
          </Descriptions>
        </Skeleton>
      </Col>
    </Row>
  );
};
