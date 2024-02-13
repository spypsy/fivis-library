import { Button, Col, Input, Row, Select } from 'antd';
import startCase from 'lodash.startcase';
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';

const { Option } = Select;

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

  const renderSearchTerm = (term: SearchTerm, index: number) => (
    <Row gutter={16} key={index}>
      <Col span={4}>
        {index > 0 && (
          <Select value={term.operator} onChange={value => handleSearchTermChange(index - 1, 'operator', value)}>
            <Option value="and">AND</Option>
            <Option value="or">OR</Option>
            <Option value="not">NOT</Option>
          </Select>
        )}
      </Col>
      <Col span={8}>
        <Input
          placeholder="Search..."
          value={term.value}
          onChange={e => handleSearchTermChange(index, 'value', e.target.value)}
        />
      </Col>
      <Col span={8}>
        <Select
          value={term.property}
          onChange={value => handleSearchTermChange(index, 'property', value)}
          style={{ width: 250 }}
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

  return (
    <>
      {searchTerms.map(renderSearchTerm)}
      <Button onClick={handleAddSearchTerm} style={{ marginTop: 15 }}>
        Add Search Term
      </Button>
      <br />
      <Button type="primary" style={{ marginTop: 30 }}>
        Search
      </Button>
      {/* Add a search button and handle the search logic */}
    </>
  );
};

export default withRouter(SearchPage);
