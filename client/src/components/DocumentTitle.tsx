import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function titleForPath(pathname: string): string {
  if (pathname.startsWith('/book/')) {
    return 'Book';
  }
  const map: Record<string, string> = {
    '/': '',
    '/login': 'Log in',
    '/register': 'Sign up',
    '/home': 'Add books',
    '/my-books': 'My books',
    '/search': 'Search',
  };
  return map[pathname] ?? '';
}

export function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const segment = titleForPath(pathname);
    document.title = segment ? `${segment} · Fivi's Library` : "Fivi's Library";
  }, [pathname]);

  return null;
}
