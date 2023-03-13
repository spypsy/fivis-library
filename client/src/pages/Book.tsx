import {
  DownloadOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Button, Col, Descriptions, Image, Input, Row, Typography } from 'antd';
import useAxios from 'axios-hooks';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Book as BookType } from 'types';

const { Paragraph } = Typography;

type EditFlags = {
  comment: boolean;
};

export const Book = () => {
  const { isbn } = useParams<{ isbn: string }>();
  const [editMode, setEditMode] = useState<EditFlags>();

  const [book, updateBook] = useState<Partial<BookType>>();
  const [{ data: bookData, loading, error }] = useAxios<BookType>({
    url: `/api/books/${isbn}`,
  });

  const updateField = (fieldName: string, value: string) => {
    updateBook((state) => ({
      ...state,
      [fieldName]: value,
    }));
  };

  console.log(bookData);

  return (
    <Row>
      <Col span={4} />
      <Col span={16}>
        <Descriptions
          bordered
          column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 2, xs: 1 }}
          title={
            <>
              <Image src={bookData?.imageLink}></Image>
              {bookData?.title}
            </>
          }
        >
          <Descriptions.Item label="Authors">
            {bookData?.authors?.map((author) => (
              <span>{author.name}</span>
            ))}
          </Descriptions.Item>

          {bookData?.publishedDate && (
            <Descriptions.Item label="Published Date">
              {new Date(bookData?.publishedDate).toLocaleDateString('en-gb', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Descriptions.Item>
          )}

          {bookData?.description && (
            <Descriptions.Item label="Description">
              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              >
                {bookData.description}
              </Paragraph>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Comment">
            {editMode?.comment ? (
              <Input.TextArea rows={4} value={bookData?.comment} />
            ) : (
              editMode?.comment
            )}
            <Button
              type="primary"
              shape="circle"
              icon={editMode?.comment ? <SaveOutlined /> : <EditOutlined />}
              size="middle"
              onClick={() =>
                setEditMode((state) => ({
                  ...state,
                  comment: !state?.comment,
                }))
              }
            />
          </Descriptions.Item>
        </Descriptions>
      </Col>
    </Row>
  );
};
