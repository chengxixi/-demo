import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  code?: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const http: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = window.localStorage.getItem('feedback_access_token');

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);

const hasApiData = <T>(
  payload: ApiResponse<T> | T,
): payload is ApiResponse<T> => {
  return typeof payload === 'object' && payload !== null && 'data' in payload;
};

export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await http.request<ApiResponse<T> | T>(config);
  const payload = response.data;

  return hasApiData<T>(payload) ? payload.data : payload;
};

export const normalizeApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    const responseError = axiosError.response?.data;

    return {
      message:
        responseError?.message ?? axiosError.message ?? '请求失败，请稍后重试',
      status: axiosError.response?.status,
      code: responseError?.code,
      details: responseError?.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: '未知错误，请稍后重试',
    details: error,
  };
};
