import { message } from 'antd';
import useAxios from 'axios-hooks';
import { clearStaleSession, notifyAuthChanged } from 'hooks/authSession';
import { useEffect, useRef } from 'react';

export function useCheckAuth() {
  const [{ error, loading }, refetch] = useAxios('/api/check-auth', { useCache: false });
  const notified = useRef(false);

  useEffect(() => {
    const onAuthChanged = () => {
      refetch();
    };
    window.addEventListener('fivis-auth-changed', onAuthChanged);
    return () => window.removeEventListener('fivis-auth-changed', onAuthChanged);
  }, [refetch]);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      clearStaleSession();
      if (!notified.current) {
        notified.current = true;
        message.error('Please login or register to access this page', 0.75);
      }
    } else if (!error) {
      notified.current = false;
    }
  }, [error, loading]);

  if (loading) {
    return { loading: true, isAuthed: false };
  }
  if (error) {
    return { loading: false, isAuthed: false };
  }
  return { loading: false, isAuthed: true };
}
