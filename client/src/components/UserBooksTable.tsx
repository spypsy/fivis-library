import { DeleteOutlined, FilterFilled } from '@ant-design/icons';
import { Button, Empty, Input, InputRef, Popconfirm, Select, Space, Switch, Table, Tag, Tooltip, message } from 'antd';
import { ColumnProps } from 'antd/es/table';
import axios from 'axios';
import useAxios from 'axios-hooks';
import RandomBookModal from 'components/RandomBookModal';
import AuthorLinks from 'components/AuthorLinks';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Book, Tag as TagType, UserBook } from 'types';
import {
  defaultMyBooksTableUiState,
  MyBooksTableUiState,
  readMyBooksUiState,
  writeMyBooksUiState,
} from 'utils/myBooksStorage';

const { Search } = Input;

const primaryColor = '#25430D';

const emptyFilters = defaultMyBooksTableUiState.filters;

function filterBooks(books: UserBook[] | undefined, newFilters: MyBooksTableUiState['filters']): UserBook[] {
  if (!books) return [];
  return books.filter((book: Book) => {
    return Object.entries(newFilters).every(([key, filterValue]) => {
      if (filterValue === '' || !filterValue?.length) return true;
      if (typeof filterValue === 'string') {
        if (key === 'title') {
          return book.title?.toLowerCase().includes(filterValue.toLowerCase());
        }
        if (key === 'publishedDate') {
          const publishYear = book.publishedDate ? new Date(book.publishedDate).getFullYear() : null;
          return publishYear !== null && publishYear.toString().includes(filterValue);
        }
        if (key === 'authors') {
          return book.authors?.some(author => author.name.toLowerCase().includes(filterValue.toLowerCase()));
        }
        if (key === 'publisher') {
          return book.publisher?.toLowerCase().includes(filterValue.toLowerCase());
        }
        return true;
      }
      if (Array.isArray(filterValue)) {
        if (!book.tags?.length) return false;
        return (filterValue as string[]).every(tagName => book.tags?.some(tag => tag.name === tagName));
      }
      return true;
    });
  });
}

type UserBooksTableProps = {
  booksData?: UserBook[];
  loading?: boolean;
  showRandomBook?: boolean;
  randomBookOpen?: boolean;
  onRandomBookOpenChange?: (open: boolean) => void;
  showToolbar?: boolean;
  emptyDescription?: React.ReactNode;
  onAfterDelete?: () => Promise<UserBook[]>;
  /** When true, quick filter, column filters, and sort are restored from local storage (my-books page). */
  persistUiState?: boolean;
};

const UserBooksTable = ({
  booksData,
  loading = false,
  showRandomBook = false,
  randomBookOpen,
  onRandomBookOpenChange,
  showToolbar = true,
  emptyDescription,
  onAfterDelete,
  persistUiState = false,
}: UserBooksTableProps) => {
  const initialUi = persistUiState ? readMyBooksUiState() : defaultMyBooksTableUiState;
  const [{ data: tagsData }] = useAxios<TagType[]>('/api/tags', { useCache: false });
  const [filteredBooks, setFilteredBooks] = useState<UserBook[]>([]);
  const [filters, setFilters] = useState(initialUi.filters);
  const [sortedInfo, setSortedInfo] = useState<any>(initialUi.sortedInfo);
  const [searchInputRefs, setSearchInputRefs] = useState<Record<string, React.RefObject<InputRef>>>({});
  const [quickFilter, setQuickFilter] = useState(initialUi.quickFilter);
  const [internalRandomOpen, setInternalRandomOpen] = useState(false);
  const isRandomBookModalOpen = randomBookOpen ?? internalRandomOpen;
  const setRandomBookModalOpen = onRandomBookOpenChange ?? setInternalRandomOpen;
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const refs: Record<string, React.RefObject<InputRef>> = {};
    ['title', 'publishedDate', 'authors', 'publisher'].forEach(key => {
      refs[key] = React.createRef<InputRef>();
    });
    setSearchInputRefs(refs);
  }, []);

  useEffect(() => {
    if (booksData) {
      setFilteredBooks(filterBooks(booksData, filters));
    }
  }, [booksData, filters]);

  useEffect(() => {
    if (!persistUiState) return;
    writeMyBooksUiState({ quickFilter, filters, sortedInfo });
  }, [persistUiState, quickFilter, filters, sortedInfo]);

  const updateBooks = (books: UserBook[]) => {
    setFilteredBooks(books);
  };

  const handleSearch = (value: string | undefined, field: string) => {
    const newFilters = { ...filters, [field]: value || '' };
    setFilters(newFilters);
    updateBooks(filterBooks(booksData, newFilters));
  };

  const handleChange = (_pagination: unknown, _filters: unknown, sorter: unknown) => {
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    updateBooks(filterBooks(booksData, emptyFilters));
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
      if (onAfterDelete) {
        updateBooks(await onAfterDelete());
      } else {
        const { data } = await axios.get('/api/books/mine');
        updateBooks(data);
      }
    } catch {
      message.error('Failed to delete book');
    }
  };

  const columns: ColumnProps<UserBook>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
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
      width: 152,
      align: 'center',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
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
      width: 200,
      render: (authors: UserBook['authors']) => <AuthorLinks authors={authors} />,
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
      width: 160,
      ellipsis: true,
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
      width: 180,
      ellipsis: true,
      render: (tags: TagType[]) => (
        <Tooltip
          style={{ width: 200 }}
          placement="topLeft"
          title={tags.map(({ name }) => (
            <Tag key={name}>
              {name}
            </Tag>
          ))}
        >
          {tags.map(({ name }) => (
            <Tag key={name}>
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
      width: 128,
      align: 'center',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (dateAdded: string) => (
        <span>
          {new Date(dateAdded).toLocaleDateString('en-gb', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      ),
      sorter: (a: UserBook, b: UserBook) => new Date(a.addedAt!)!.getTime() - new Date(b.addedAt!)!.getTime(),
      sortOrder: sortedInfo.columnKey === 'addedAt' && sortedInfo.order,
    },
    ...(showDeleteButtons
      ? [
          {
            title: '',
            key: 'delete',
            width: 56,
            render: (_: string | undefined, record: UserBook) => (
              <Popconfirm title="Remove from your library?" onConfirm={() => handleDelete(record?.isbn)} okText="Delete" okButtonProps={{ danger: true }}>
                <Button icon={<DeleteOutlined />} danger type="text" />
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  const displayBooks = useMemo(() => {
    if (!quickFilter.trim()) {
      return filteredBooks;
    }
    const q = quickFilter.toLowerCase();
    return filteredBooks.filter(book => {
      const title = book.title?.toLowerCase() || '';
      const authors = book.authors?.map(a => a.name.toLowerCase()).join(' ') || '';
      return title.includes(q) || authors.includes(q);
    });
  }, [filteredBooks, quickFilter]);

  const defaultEmpty = (
    <Empty description="No books yet">
      <Button type="primary" onClick={() => history.push('/home')}>
        Scan your first book
      </Button>
    </Empty>
  );

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {showToolbar && (
          <Space wrap>
            <Input.Search
              placeholder="Quick filter by title or author"
              allowClear
              value={quickFilter}
              onChange={e => setQuickFilter(e.target.value)}
              style={{ maxWidth: 320 }}
            />
            <Button onClick={clearFilters}>Clear filters</Button>
            <Button onClick={clearSorting}>Clear sorting</Button>
            <Space size="small">
              <Switch checked={showDeleteButtons} onChange={setShowDeleteButtons} />
              Show delete buttons
            </Space>
            {showRandomBook && !onRandomBookOpenChange && (
              <Button type="primary" onClick={() => setRandomBookModalOpen(true)}>
                Random book
              </Button>
            )}
          </Space>
        )}
        <Table
          className="user-books-table"
          loading={loading}
          dataSource={displayBooks}
          columns={columns}
          rowKey={(book: UserBook) => book.isbn}
          tableLayout="fixed"
          pagination={{ showSizeChanger: true, pageSizeOptions: [25, 50, 100, 250], defaultPageSize: 50 }}
          onChange={handleChange}
          locale={{
            emptyText: emptyDescription ?? defaultEmpty,
          }}
        />
      </Space>
      {(showRandomBook || onRandomBookOpenChange) && (
        <RandomBookModal isOpen={isRandomBookModalOpen} onClose={() => setRandomBookModalOpen(false)} tags={tagsData || []} />
      )}
    </>
  );
};

export default UserBooksTable;
