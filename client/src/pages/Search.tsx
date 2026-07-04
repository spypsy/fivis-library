import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Input, Row, Select, Space, Spin, Table, Typography } from 'antd';
import { ColumnProps } from 'antd/es/table';
import startCase from 'lodash.startcase';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAxios from 'axios-hooks';
import AuthorLinks from 'components/AuthorLinks';
import PageShell from 'components/PageShell';
import { Author, Tag as TagType, UserBook } from 'types';

const searchProperties = ['any', 'title', 'subtitle', 'tags', 'authors', 'publisher', 'isbn', 'description'];

type SearchTerm = {
  value: string;
  property: string;
  operator: string;
};

const SearchPage = () => {
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([{ value: '', property: 'any', operator: 'and' }]);
  const [results, setResults] = useState<UserBook[] | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);

  const [{ loading }, executeSearch] = useAxios<UserBook[]>(
    { url: '/api/books/search', method: 'POST' },
    { manual: true },
  );

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

  const hasQuery = searchTerms.some(term => term.value.trim());

  const handleSearch = async () => {
    if (!hasQuery) {
      return;
    }
    setHasSearched(true);
    try {
      const { data } = await executeSearch({ data: { search: searchTerms } });
      setResults(data || []);
    } catch {
      setResults([]);
    }
  };

  const renderSearchTerm = (term: SearchTerm, index: number) => (
    <Row gutter={[16, 8]} key={index} style={{ marginBottom: 16 }} align="middle">
      <Col xs={24} sm={4}>
        {index > 0 && (
          <Select
            value={term.operator}
            onChange={value => handleSearchTermChange(index, 'operator', value)}
            style={{ width: '100%' }}
            options={[
              { value: 'and', label: 'AND' },
              { value: 'or', label: 'OR' },
              { value: 'not', label: 'NOT' },
            ]}
          />
        )}
      </Col>
      <Col xs={4} sm={2}>
        <Button
          icon={<CloseOutlined />}
          onClick={() => handleRemoveSearchTerm(index)}
          disabled={searchTerms.length === 1}
        />
      </Col>
      <Col xs={24} sm={10}>
        <Input
          placeholder="Search..."
          value={term.value}
          onChange={e => handleSearchTermChange(index, 'value', e.target.value)}
          onPressEnter={handleSearch}
        />
      </Col>
      <Col xs={24} sm={8}>
        <Select
          value={term.property}
          onChange={value => handleSearchTermChange(index, 'property', value)}
          style={{ width: '100%' }}
          options={searchProperties.map(property => ({
            value: property,
            label: startCase(property),
          }))}
        />
      </Col>
    </Row>
  );

  const columns: ColumnProps<UserBook>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title: string, book: UserBook) => (
        <Link to={`/book/${book.isbn}`}>
          <strong>{title || 'Untitled'}</strong>
        </Link>
      ),
    },
    {
      title: 'Year',
      dataIndex: 'publishedDate',
      render: (d: string) => (d ? new Date(d).getFullYear() : ''),
    },
    {
      title: 'Authors',
      dataIndex: 'authors',
      render: (authors: Author[]) => <AuthorLinks authors={authors} />,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (tags: TagType[]) => tags?.map(t => t.name).join(', '),
    },
  ];

  return (
    <PageShell title="Search" subtitle="Find books in your library">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {searchTerms.map(renderSearchTerm)}
        <Row gutter={[16, 8]}>
          <Col xs={12} sm={8}>
            <Button onClick={handleAddSearchTerm}>Add search term</Button>
          </Col>
          <Col xs={12} sm={4}>
            <Button type="primary" onClick={handleSearch} disabled={!hasQuery} loading={loading}>
              Search
            </Button>
          </Col>
        </Row>

        {loading && <Spin />}
        {hasSearched && !loading && results?.length === 0 && (
          <Empty description="No books match. Try broader terms or fewer filters." />
        )}
        {results && results.length > 0 && (
          <>
            <Typography.Text type="secondary">{results.length} result(s)</Typography.Text>
            <Table dataSource={results} columns={columns} rowKey="isbn" pagination={{ pageSize: 25 }} />
          </>
        )}
      </Space>
    </PageShell>
  );
};

export default SearchPage;
