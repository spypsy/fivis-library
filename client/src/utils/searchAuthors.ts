import axios from 'axios';
import { Author } from 'types';

export const AUTHOR_SEARCH_MIN_LENGTH = 3;

export async function searchAuthors(query: string): Promise<Author[]> {
  const trimmed = query.trim();
  if (trimmed.length < AUTHOR_SEARCH_MIN_LENGTH) {
    return [];
  }

  const { data } = await axios.get<Author[]>('/api/authors/search', { params: { q: trimmed } });
  return Array.isArray(data) ? data : [];
}

export function normalizeAuthorsInput(authors?: (Author | string)[]): Author[] {
  return (authors || []).map((author, index) => {
    if (typeof author === 'string') {
      return { id: `external-${index}-${author}`, name: author };
    }
    return author;
  });
}

export function filterUnselectedAuthors(authors: Author[], selected: Author[]): Author[] {
  const selectedIds = new Set(selected.map(author => String(author.id)));
  return authors.filter(author => !selectedIds.has(String(author.id)));
}

export function pickAuthorFromSearchQuery(query: string, authors: Author[]): Author | undefined {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  const exact = authors.find(author => author.name.toLowerCase() === lower);
  if (exact) {
    return exact;
  }

  const prefixMatches = authors.filter(author => author.name.toLowerCase().startsWith(lower));
  if (prefixMatches.length === 1) {
    return prefixMatches[0];
  }

  return undefined;
}
