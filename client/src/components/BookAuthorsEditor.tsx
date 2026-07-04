import { Button, Input, Space, Tag, message } from 'antd';
import axios from 'axios';
import AddAuthorModal from 'components/AddAuthorModal';
import AuthorLinks from 'components/AuthorLinks';
import { useEffect, useMemo, useState } from 'react';
import { Author } from 'types';
import {
  AUTHOR_SEARCH_MIN_LENGTH,
  filterUnselectedAuthors,
  pickAuthorFromSearchQuery,
  searchAuthors,
} from 'utils/searchAuthors';

const SEARCH_DEBOUNCE_MS = 300;

type BookAuthorsEditorProps = {
  authors?: Author[];
  editMode: boolean;
  onChange: (authors: Author[]) => void;
};

type CompletedSearch = {
  query: string;
  results: Author[];
  failed: boolean;
};

const BookAuthorsEditor = ({ authors, editMode, onChange }: BookAuthorsEditorProps) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [completedSearch, setCompletedSearch] = useState<CompletedSearch | undefined>();
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchText.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (debouncedQuery.length < AUTHOR_SEARCH_MIN_LENGTH) {
      setSearchLoading(false);
      setCompletedSearch(undefined);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    searchAuthors(debouncedQuery)
      .then(results => {
        if (cancelled) {
          return;
        }
        setCompletedSearch({ query: debouncedQuery, results, failed: false });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setCompletedSearch({ query: debouncedQuery, results: [], failed: true });
      })
      .finally(() => {
        if (!cancelled) {
          setSearchLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const selectedAuthors = useMemo(() => authors ?? [], [authors]);
  const trimmedSearch = searchText.trim();
  const searchIsReady = completedSearch?.query === debouncedQuery && !searchLoading;

  const suggestions = useMemo(() => {
    if (!searchIsReady || !completedSearch) {
      return [];
    }
    return filterUnselectedAuthors(completedSearch.results, selectedAuthors);
  }, [searchIsReady, completedSearch, selectedAuthors]);

  const showDropdown = trimmedSearch.length >= AUTHOR_SEARCH_MIN_LENGTH;

  const addAuthor = (author: Author) => {
    if (selectedAuthors.some(existing => String(existing.id) === String(author.id))) {
      return;
    }
    onChange([...selectedAuthors, author]);
    setSearchText('');
  };

  const removeAuthor = (authorId: string) => {
    onChange(selectedAuthors.filter(author => String(author.id) !== String(authorId)));
  };

  const resolveAuthorFromQuery = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      return undefined;
    }

    if (
      completedSearch?.query === trimmed &&
      !completedSearch.failed &&
      completedSearch.results.length
    ) {
      const fromCache = pickAuthorFromSearchQuery(trimmed, filterUnselectedAuthors(completedSearch.results, selectedAuthors));
      if (fromCache) {
        return fromCache;
      }
    }

    if (trimmed.length < AUTHOR_SEARCH_MIN_LENGTH) {
      return undefined;
    }

    const results = await searchAuthors(trimmed);
    return pickAuthorFromSearchQuery(trimmed, filterUnselectedAuthors(results, selectedAuthors));
  };

  const commitSearchText = async () => {
    const trimmed = searchText.trim();
    if (!trimmed) {
      return;
    }

    if (selectedAuthors.some(existing => existing.name.toLowerCase() === trimmed.toLowerCase())) {
      setSearchText('');
      return;
    }

    try {
      const matched = await resolveAuthorFromQuery(trimmed);
      if (matched) {
        addAuthor(matched);
        return;
      }
    } catch {
      message.error('Could not search authors');
      return;
    }

    try {
      const { data } = await axios.post<Author>('/api/authors', { name: trimmed });
      addAuthor(data);
    } catch (err) {
      const duplicate =
        axios.isAxiosError(err) &&
        typeof err.response?.data === 'string' &&
        err.response.data.includes('already exists');
      if (duplicate) {
        try {
          const { data } = await axios.get<{ author: Author }>(
            `/api/authors/by-name/${encodeURIComponent(trimmed)}`,
          );
          addAuthor(data.author);
          return;
        } catch {
          // fall through to generic error
        }
      }

      const detail =
        axios.isAxiosError(err) && typeof err.response?.data === 'string'
          ? err.response.data
          : 'Failed to add author';
      message.error(detail);
    }
  };

  if (!editMode) {
    return <AuthorLinks authors={authors} />;
  }

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Space wrap size={[4, 4]}>
          {selectedAuthors.map(author => (
            <Tag key={author.id} closable onClose={() => removeAuthor(author.id)}>
              {author.name}
            </Tag>
          ))}
        </Space>
        <Space wrap style={{ width: '100%' }}>
          <div className="author-search-field">
            <Input
              style={{ minWidth: 240, flex: 1 }}
              value={searchText}
              placeholder={
                trimmedSearch.length > 0 && trimmedSearch.length < AUTHOR_SEARCH_MIN_LENGTH
                  ? `Type ${AUTHOR_SEARCH_MIN_LENGTH - trimmedSearch.length} more character(s)`
                  : 'Search authors (min. 3 characters)'
              }
              onChange={event => setSearchText(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void commitSearchText();
                }
              }}
            />
            {showDropdown && (
              <div className="author-search-dropdown" role="listbox">
                {!searchIsReady && (
                  <div className="author-search-dropdown-empty">Searching…</div>
                )}
                {searchIsReady &&
                  suggestions.map(author => (
                    <button
                      key={author.id}
                      type="button"
                      className="author-search-dropdown-option"
                      role="option"
                      aria-selected={false}
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => addAuthor(author)}
                    >
                      {author.name}
                    </button>
                  ))}
                {searchIsReady && completedSearch?.failed && (
                  <div className="author-search-dropdown-empty">
                    Search failed — try again or use Add author
                  </div>
                )}
                {searchIsReady && !completedSearch?.failed && suggestions.length === 0 && (
                  <div className="author-search-dropdown-empty">
                    No matching authors — press Enter to create or use Add author
                  </div>
                )}
              </div>
            )}
          </div>
          <Button onClick={() => setAddModalOpen(true)}>Add author</Button>
        </Space>
      </Space>
      <AddAuthorModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={author => addAuthor(author)}
      />
    </>
  );
};

type BookAuthorsEditorFormControlProps = {
  value?: Author[];
  onChange?: (authors: Author[]) => void;
};

export const BookAuthorsEditorFormControl = ({ value, onChange }: BookAuthorsEditorFormControlProps) => (
  <BookAuthorsEditor authors={value} editMode onChange={authors => onChange?.(authors)} />
);

export default BookAuthorsEditor;
