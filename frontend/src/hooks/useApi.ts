import { useCallback } from 'react';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

export const useApi = () => {
  const handleError = useCallback((error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        code: error.code || 'UNKNOWN_ERROR',
        details: error.response?.data,
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }, []);

  const get = useCallback(
    async <T,>(endpoint: string, config = {}) => {
      try {
        const response = await axios.get<T>(`${API_URL}${endpoint}`, config);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: handleError(error) };
      }
    },
    [handleError]
  );

  const post = useCallback(
    async <T,>(endpoint: string, data?: unknown, config = {}) => {
      try {
        const response = await axios.post<T>(`${API_URL}${endpoint}`, data, config);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: handleError(error) };
      }
    },
    [handleError]
  );

  const put = useCallback(
    async <T,>(endpoint: string, data?: unknown, config = {}) => {
      try {
        const response = await axios.put<T>(`${API_URL}${endpoint}`, data, config);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: handleError(error) };
      }
    },
    [handleError]
  );

  const delete_ = useCallback(
    async <T,>(endpoint: string, config = {}) => {
      try {
        const response = await axios.delete<T>(`${API_URL}${endpoint}`, config);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: handleError(error) };
      }
    },
    [handleError]
  );

  return {
    get,
    post,
    put,
    delete: delete_,
  };
};
