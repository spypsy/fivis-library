import { DeleteOutlined, FilterFilled } from '@ant-design/icons';
import { Button, Checkbox, Input, InputRef, Select, Table, Tag, Tooltip, message } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import axios from 'axios';
import useAxios from 'axios-hooks';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Author, Book, Tag as TagType, UserBook } from 'types';

const { Search } = Input;

const primaryColor = '#25430D';

const emptyFilters = {
  title: '',
  publishedDate: '',
  authors: '',
  publisher: '',
  tags: [],
};

const MyBooks = () => {
  const [{ data: booksData, loading }] = useAxios<UserBook[]>('/api/books/mine', { manual: false, useCache: false });
  const [{ data: tagsData }] = useAxios<TagType[]>('/api/tags', { useCache: false });
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [searchInputRefs, setSearchInputRefs] = useState<Record<string, React.RefObject<InputRef>>>({});
  const [showDeleteColumn, setShowDeleteColumn] = useState(false);

  useEffect(() => {
    const refs: Record<string, React.RefObject<InputRef>> = {};
    ['title', 'publishedDate', 'authors', 'publisher'].forEach(key => {
      refs[key] = React.createRef<InputRef>();
    });
    setSearchInputRefs(refs);
  }, []);

  useEffect(() => {
    if (booksData) {
      setFilteredBooks(booksData);
    }
  }, [booksData]);

  const handleSearch = (value: string | undefined, field: string) => {
    const newFilters = { ...filters, [field]: value || '' };
    setFilters(newFilters);

    const filtered = booksData?.filter((book: Book) => {
      return Object.entries(newFilters).every(([key, filterValue]) => {
        if (filterValue === '' || !filterValue?.length) return true; // Skip empty filters
        if (typeof filterValue === 'string') {
          switch (key) {
            case 'title':
              return book.title?.toLowerCase().includes(filterValue.toLowerCase());
            case 'publishedDate':
              const publishYear = book.publishedDate ? new Date(book.publishedDate).getFullYear() : null;
              return publishYear !== null && publishYear.toString().includes(filterValue);
            case 'authors':
              return book.authors?.some(author => author.name.toLowerCase().includes(filterValue.toLowerCase()));
            case 'publisher':
              return book.publisher?.toLowerCase().includes(filterValue.toLowerCase());
            default:
              return true;
          }
        } else if (Array.isArray(filterValue)) {
          if (!book.tags?.length) return false;
          return (filterValue as string[]).every(tagName => book.tags?.some(tag => tag.name === tagName));
        }
        return true;
      });
    });

    setFilteredBooks(filtered || []);
  };

  const handleChange = (pagination: any, filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setFilteredBooks(booksData || []);
  };

  const clearSorting = () => {
    setSortedInfo({});
  };

  const handleDelete = async (isbn: string | undefined) => {
    if (!isbn) {
      message.error('Book not found');
      return;
    }
    try {
      await axios.delete(`/api/books/${isbn}`);
      message.success('Book deleted successfully');
      // Refresh the book list
      const { data } = await axios.get('/api/books/mine');
      setFilteredBooks(data);
    } catch (error) {
      message.error('Failed to delete book');
    }
  };

  const columns: ColumnProps<UserBook>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string | undefined, book: UserBook) => (
        <Link to={`/book/${book.isbn}`}>
          <b>{title || 'Untitled'}</b>
        </Link>
      ),
      filterDropdown: () => (
        <Search
          ref={searchInputRefs.title}
          placeholder="Search title"
          onSearch={value => handleSearch(value, 'title')}
          style={{ width: 200, padding: 8 }}
        />
      ),
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInputRefs.title.current?.select(), 200);
        }
      },
      filterIcon: () => <FilterFilled style={{ color: filters.title ? primaryColor : undefined }} />,
      sorter: (a: UserBook, b: UserBook) => (a.title || '').localeCompare(b.title || ''),
      sortOrder: sortedInfo.columnKey === 'title' && sortedInfo.order,
    },
    {
      title: 'Publish Year',
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      render: (publishedDate: Date) => <span>{new Date(publishedDate).getFullYear()}</span>,
      filterDropdown: () => (
        <Search
          ref={searchInputRefs.publishedDate}
          placeholder="Search year"
          onSearch={value => handleSearch(value, 'publishedDate')}
          style={{ width: 200, padding: 8 }}
        />
      ),
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInputRefs.publishedDate.current?.select(), 200);
        }
      },
      filterIcon: () => <FilterFilled style={{ color: filters.publishedDate ? primaryColor : undefined }} />,
      sorter: (a: UserBook, b: UserBook) => {
        const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
        const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
        return dateA - dateB;
      },
      sortOrder: sortedInfo.columnKey === 'publishedDate' && sortedInfo.order,
    },
    {
      title: 'Author(s)',
      dataIndex: 'authors',
      key: 'authors',
      render: (authors: Author[]) => authors?.map(author => author.name).join(', ') || '',
      filterDropdown: () => (
        <Search
          ref={searchInputRefs.authors}
          placeholder="Search authors"
          onSearch={value => handleSearch(value, 'authors')}
          style={{ width: 200, padding: 8 }}
        />
      ),
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInputRefs.authors.current?.select(), 200);
        }
      },
      filterIcon: () => <FilterFilled style={{ color: filters.authors ? primaryColor : undefined }} />,
      sorter: (a: Book, b: Book) => {
        const authorA = a.authors?.[0]?.name || '';
        const authorB = b.authors?.[0]?.name || '';
        return authorA.localeCompare(authorB);
      },
      sortOrder: sortedInfo.columnKey === 'authors' && sortedInfo.order,
    },
    {
      title: 'Publisher',
      dataIndex: 'publisher',
      key: 'publisher',
      filterDropdown: () => (
        <Search
          ref={searchInputRefs.publisher}
          placeholder="Search publisher"
          onSearch={value => handleSearch(value, 'publisher')}
          style={{ width: 200, padding: 8 }}
        />
      ),
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInputRefs.publisher.current?.select(), 200);
        }
      },
      filterIcon: () => <FilterFilled style={{ color: filters.publisher ? primaryColor : undefined }} />,
      sorter: (a: Book, b: Book) => a.publisher.localeCompare(b.publisher),
      sortOrder: sortedInfo.columnKey === 'publisher' && sortedInfo.order,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      ellipsis: true,
      render: (tags: TagType[]) => (
        <Tooltip
          style={{ width: 200 }}
          placement="topLeft"
          title={tags.map(({ name }) => (
            <Tag color="purple" key={name}>
              {name}
            </Tag>
          ))}
        >
          {tags.map(({ name }) => (
            <Tag color="purple" key={name}>
              {name}
            </Tag>
          ))}
        </Tooltip>
      ),
      filterDropdown: () => (
        <Select
          placeholder="Search tags"
          onChange={value => handleSearch(value, 'tags')}
          style={{ width: 200, padding: 8 }}
          mode="tags"
          options={tagsData?.map(tag => ({ label: tag.name, value: tag.name }))}
        />
      ),
      filterIcon: () => <FilterFilled style={{ color: filters.tags?.length ? primaryColor : undefined }} />,
    },
    {
      title: 'Date Added',
      dataIndex: 'addedAt',
      key: 'addedAt',
      render: (dateAdded: string) => <span>{new Date(dateAdded).toLocaleDateString()}</span>,
      sorter: (a: UserBook, b: UserBook) => new Date(a.addedAt!)!.getTime() - new Date(b.addedAt!)!.getTime(),
      sortOrder: sortedInfo.columnKey === 'addedAt' && sortedInfo.order,
    },
  ];

  if (showDeleteColumn) {
    columns.push({
      title: 'Delete',
      key: 'delete',
      render: (_: string | undefined, record: UserBook) => (
        <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record?.isbn)} danger />
      ),
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={clearFilters} style={{ marginRight: 8 }}>
          Clear Filters
        </Button>
        <Button onClick={clearSorting} style={{ marginRight: 8 }}>
          Clear Sorting
        </Button>
        <Checkbox checked={showDeleteColumn} onChange={e => setShowDeleteColumn(e.target.checked)}>
          Show Delete Column
        </Checkbox>
      </div>
      Total: {booksData?.length}
      <Table
        loading={loading}
        dataSource={filteredBooks}
        columns={columns}
        rowKey={({ isbn }) => isbn}
        pagination={{ showSizeChanger: true, pageSizeOptions: ['25', '50', '100', '250'], defaultPageSize: 50 }}
        onChange={handleChange}
      />
    </div>
  );
};

export default MyBooks;
