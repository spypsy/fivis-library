import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Space } from 'antd';
import startCase from 'lodash.startcase';
import { useState } from 'react';

const { Option } = Select;

// type SearchProperty = 'any' | 'title' | 'subtitle' | 'tags' | 'authors' | 'publisher' | 'isbn' | 'description';

const searchProperties = ['any', 'title', 'subtitle', 'tags', 'authors', 'publisher', 'isbn', 'description'];

type SearchTerm = {
  value: string;
  property: string;
  operator: string;
};

const SearchPage = () => {
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([{ value: '', property: 'any', operator: 'and' }]);

  const handleAddSearchTerm = () => {
    setSearchTerms([...searchTerms, { value: '', property: 'any', operator: 'and' }]);
  };

  const handleSearchTermChange = (index: number, field: keyof SearchTerm, value: string) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index][field] = value;
    setSearchTerms(newSearchTerms);
  };

  const handleRemoveSearchTerm = (index: number) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms.splice(index, 1);
    setSearchTerms(newSearchTerms);
  };

  const renderSearchTerm = (term: SearchTerm, index: number) => (
    <Row gutter={[16, 8]} key={index} style={{ marginBottom: 16 }}>
      <Col xs={12} sm={4}>
        {index > 0 && (
          <Select
            value={term.operator}
            onChange={value => handleSearchTermChange(index - 1, 'operator', value)}
            style={{ width: '100%' }}
          >
            <Option value="and">AND</Option>
            <Option value="or">OR</Option>
            <Option value="not">NOT</Option>
          </Select>
        )}
      </Col>
      <Col xs={12} sm={2}>
        <Button
          icon={<CloseOutlined />}
          onClick={() => handleRemoveSearchTerm(index)}
          disabled={searchTerms.length === 1}
          style={{ width: '100%' }}
        />
      </Col>
      <Col xs={24} sm={10}>
        <Input
          placeholder="Search..."
          value={term.value}
          onChange={e => handleSearchTermChange(index, 'value', e.target.value)}
        />
      </Col>
      <Col xs={24} sm={8}>
        <Select
          value={term.property}
          onChange={value => handleSearchTermChange(index, 'property', value)}
          style={{ width: '100%' }}
        >
          {searchProperties.map(property => (
            <Option key={property} value={property}>
              {startCase(property)}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );

  const handleSearch = () => {
    // Implement search logic here
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {searchTerms.map(renderSearchTerm)}
      <Row gutter={[16, 8]}>
        <Col xs={12} sm={8}>
          <Button onClick={handleAddSearchTerm}>Add Search Term</Button>
        </Col>
        <Col xs={12} sm={4}>
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </Col>
      </Row>
    </Space>
  );
};

export default SearchPage;
