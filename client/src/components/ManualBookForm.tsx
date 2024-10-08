import { Button, Col, DatePicker, Form, FormInstance, Input, InputNumber, Row, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { languages } from 'countries-list';
import { Tag, UserBook } from 'types';

const ManualBookForm = ({
  onFinish,
  addingBook,
  tags,
  formRef,
}: {
  onFinish: (values: Partial<UserBook>) => void;
  addingBook: boolean;
  tags: Tag[];
  formRef: FormInstance<UserBook>;
}) => {
  return (
    <Form<UserBook> form={formRef} onFinish={onFinish} layout="vertical" size="small">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="subtitle" label="Subtitle">
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={10}>
          <Form.Item name="publisher" label="Publisher">
            <Input />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item name="publishedDate" label="Published Year" rules={[{ required: true }]}>
            <DatePicker picker="year" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item name="originalPublishedYear" label="Original Published Year">
            <DatePicker picker="year" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Select or enter tags"
              options={tags.map(tag => ({ value: tag.name, label: tag.name }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="authors" label="Authors" rules={[{ required: true }]}>
            <Select mode="tags" style={{ width: '100%' }} placeholder="Enter authors" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="isbn" label="ISBN">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="pageCount" label="Page Count">
            <InputNumber min={1} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="language" label="Language" rules={[{ required: true }]}>
            <Select
              showSearch
              options={Object.entries(languages)
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .map(([key, value]) => ({ value: key, label: value.name }))}
              filterOption={(value, option) => {
                if (!option) {
                  return false;
                }
                return option.label.toLowerCase().startsWith(value.toLowerCase());
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="originalLanguage" label="Original Language">
            <Select
              showSearch
              options={Object.entries(languages)
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .map(([key, value]) => ({ value: key, label: value.name }))}
              filterOption={(value, option) => {
                if (!option) {
                  return false;
                }
                return option.label.toLowerCase().startsWith(value.toLowerCase());
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="description"
            label={
              <span>
                <b>Book</b> Description
              </span>
            }
          >
            <TextArea rows={4} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="comment"
            label={
              <span>
                <b>User</b> Comment
              </span>
            }
          >
            <TextArea rows={4} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={addingBook}>
          Add Book
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ManualBookForm;
