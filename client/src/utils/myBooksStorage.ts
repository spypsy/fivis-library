import { UserBook } from 'types';

const BOOKS_CACHE_PREFIX = 'my-books-cache';
const UI_STATE_PREFIX = 'my-books-ui';

function storageSuffix(): string {
  try {
    const user = localStorage.getItem('user');
    if (!user) return '';
    const parsed = JSON.parse(user) as { id?: string; email?: string };
    const id = parsed.id ?? parsed.email;
    return id ? `-${id}` : '';
  } catch {
    return '';
  }
}

export function myBooksCacheKey(): string {
  return `${BOOKS_CACHE_PREFIX}${storageSuffix()}`;
}

export function myBooksUiStateKey(): string {
  return `${UI_STATE_PREFIX}${storageSuffix()}`;
}

export function readMyBooksCache(): UserBook[] | undefined {
  try {
    const raw = localStorage.getItem(myBooksCacheKey());
    if (!raw) return undefined;
    return JSON.parse(raw) as UserBook[];
  } catch {
    return undefined;
  }
}

export function writeMyBooksCache(books: UserBook[]): void {
  try {
    localStorage.setItem(myBooksCacheKey(), JSON.stringify(books));
  } catch {
    // ignore quota / private mode
  }
}

export type MyBooksTableUiState = {
  quickFilter: string;
  filters: {
    title: string;
    publishedDate: string;
    authors: string;
    publisher: string;
    tags: string[];
  };
  sortedInfo: {
    columnKey?: string;
    field?: string;
    order?: 'ascend' | 'descend' | null;
  };
};

export const defaultMyBooksTableUiState: MyBooksTableUiState = {
  quickFilter: '',
  filters: {
    title: '',
    publishedDate: '',
    authors: '',
    publisher: '',
    tags: [],
  },
  sortedInfo: { columnKey: 'addedAt', field: 'addedAt', order: 'descend' },
};

export function readMyBooksUiState(): MyBooksTableUiState {
  try {
    const raw = localStorage.getItem(myBooksUiStateKey());
    if (!raw) return defaultMyBooksTableUiState;
    const parsed = JSON.parse(raw) as Partial<MyBooksTableUiState>;
    return {
      quickFilter: parsed.quickFilter ?? '',
      filters: { ...defaultMyBooksTableUiState.filters, ...parsed.filters },
      sortedInfo: { ...defaultMyBooksTableUiState.sortedInfo, ...parsed.sortedInfo },
    };
  } catch {
    return defaultMyBooksTableUiState;
  }
}

export function writeMyBooksUiState(state: MyBooksTableUiState): void {
  try {
    localStorage.setItem(myBooksUiStateKey(), JSON.stringify(state));
  } catch {
    // ignore
  }
}
