import { message } from 'antd';
import useAxios from 'axios-hooks';

let n = 0;
export function useCheckAuth() {
  const [{ error, loading }] = useAxios('/api/check-auth');
  n += 1;
  console.log('using axios', n);
  if (error?.response?.status === 401) {
    message.error('Please login or register to access this page', 0.75);
    return { loading, isAuthed: false };
  }
  return { loading, isAuthed: true };
}
