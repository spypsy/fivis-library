import axios from 'axios';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// A custom hook that checks for 401 errors and redirects to login
export function useCheckAuthError(error: any) {
  const history = useHistory();

  useEffect(() => {
    // Check if error is an axios error
    if (axios.isAxiosError(error)) {
      // Check if error response status is 401
      if (error.response?.status === 401) {
        history.push('/login');
      }
    }
  }, [error, history]);
}
