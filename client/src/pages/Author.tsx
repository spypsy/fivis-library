import { Empty, Button, Input, Space, Typography, message } from 'antd';
import axios from 'axios';
import useAxios from 'axios-hooks';
import PageShell from 'components/PageShell';
import UserBooksTable from 'components/UserBooksTable';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Author, UserBook } from 'types';
import { authorPagePath } from 'utils/authorPath';

type AuthorPageData = {
  author: Author;
  books: UserBook[];
};

const AuthorPage = () => {
  const history = useHistory();
  const { authorName: encodedName } = useParams<{ authorName: string }>();
  const authorName = decodeURIComponent(encodedName);
  const [editMode, setEditMode] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const [{ data, loading, error }, refetch] = useAxios<AuthorPageData>(
    {
      url: `/api/authors/by-name/${encodeURIComponent(authorName)}`,
    },
    { useCache: false },
  );

  useEffect(() => {
    if (data?.author.name) {
      setNameDraft(data.author.name);
    }
  }, [data?.author.name]);

  const onSaveName = async () => {
    if (!data?.author.id) {
      return;
    }
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      message.error('Name is required');
      return;
    }
    if (trimmed === data.author.name) {
      setEditMode(false);
      return;
    }

    try {
      await axios.put(`/api/authors/${data.author.id}`, { name: trimmed });
      message.success('Author updated');
      setEditMode(false);
      if (trimmed !== authorName) {
        history.replace(authorPagePath(trimmed));
      } else {
        refetch();
      }
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data === 'string'
          ? err.response.data
          : 'Failed to update author';
      message.error(msg);
    }
  };

  const actions = (
    <Space wrap>
      {editMode && (
        <>
          <Button
            onClick={() => {
              setEditMode(false);
              setNameDraft(data?.author.name || '');
            }}
          >
            Cancel
          </Button>
          <Button type="primary" onClick={onSaveName}>
            Save
          </Button>
        </>
      )}
      {!editMode && (
        <Button onClick={() => setEditMode(true)}>Edit name</Button>
      )}
    </Space>
  );

  if (error && !loading) {
    return (
      <PageShell title="Author not found">
        <Typography.Text type="secondary">No author matches this page.</Typography.Text>
      </PageShell>
    );
  }

  const bookCount = data?.books.length ?? 0;

  return (
    <PageShell
      title={
        editMode ? (
          <Input value={nameDraft} onChange={e => setNameDraft(e.target.value)} style={{ maxWidth: 480 }} />
        ) : (
          data?.author.name || authorName
        )
      }
      subtitle={bookCount === 1 ? '1 book in your library' : `${bookCount} books in your library`}
      extra={actions}
    >
      <UserBooksTable
        booksData={data?.books}
        loading={loading}
        showToolbar
        emptyDescription={<Empty description="No books by this author in your library" />}
        onAfterDelete={async () => {
          const name = data?.author.name ?? authorName;
          const response = await axios.get<AuthorPageData>(
            `/api/authors/by-name/${encodeURIComponent(name)}`,
          );
          return response.data.books;
        }}
      />
    </PageShell>
  );
};

export default AuthorPage;
