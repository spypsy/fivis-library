import { Button, Table } from 'antd';
import { ColumnProps } from 'antd/es/table';
import useAxios from 'axios-hooks';
import AddAuthorModal from 'components/AddAuthorModal';
import PageShell from 'components/PageShell';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Author, AuthorSummary } from 'types';
import { authorPagePath } from 'utils/authorPath';

const Authors = () => {
  const history = useHistory();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [{ data: authors, loading }, refetch] = useAxios<AuthorSummary[]>('/api/authors/all', { useCache: false });

  const onAuthorCreated = (author: Author) => {
    refetch();
    history.push(authorPagePath(author.name));
  };

  const columns: ColumnProps<AuthorSummary>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Link to={authorPagePath(name)}>{name}</Link>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Books',
      dataIndex: 'bookCount',
      key: 'bookCount',
      sorter: (a, b) => a.bookCount - b.bookCount,
    },
    {
      title: 'Last updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (lastUpdated?: string) =>
        lastUpdated
          ? new Date(lastUpdated).toLocaleDateString('en-gb', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '—',
      sorter: (a, b) => {
        const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return dateA - dateB;
      },
    },
  ];

  const total = authors?.length ?? 0;

  return (
    <PageShell
      title="Authors"
      subtitle={total === 1 ? '1 author' : `${total} authors`}
      extra={
        <Button type="primary" onClick={() => setAddModalOpen(true)}>
          Add author
        </Button>
      }
    >
      <Table
        loading={loading}
        dataSource={authors}
        columns={columns}
        rowKey={author => author.id}
        pagination={{ showSizeChanger: true, pageSizeOptions: [25, 50, 100], defaultPageSize: 50 }}
      />
      <AddAuthorModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onCreated={onAuthorCreated} />
    </PageShell>
  );
};

export default Authors;
