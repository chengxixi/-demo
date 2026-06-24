import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '@/types';

/** 创建 Axios 实例，统一基础配置 */
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 请求拦截器 */
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 按需注入 token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/** 响应拦截器 */
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    // 根据后端约定的 code 判断业务状态
    if (data.code !== 0 && data.code !== 200) {
      console.error(`[HTTP] 业务异常: ${data.message}`);
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return response;
  },
  (error) => {
    // 统一 HTTP 错误处理
    if (error.response) {
      const status = error.response.status;
      const errorMap: Record<number, string> = {
        401: '登录已过期，请重新登录',
        403: '没有访问权限',
        404: '请求的资源不存在',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务暂不可用',
      };
      const message = errorMap[status] ?? `请求失败 (${status})`;
      console.error(`[HTTP] ${message}`);
    } else if (error.code === 'ECONNABORTED') {
      console.error('[HTTP] 请求超时');
    } else {
      console.error('[HTTP] 网络异常');
    }
    return Promise.reject(error);
  },
);

/**
 * 泛型 GET 请求
 * @param url 请求地址
 * @param params 查询参数
 * @param config 额外配置
 */
export function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<ApiResponse<T>>> {
  return http.get<ApiResponse<T>>(url, { params, ...config });
}

/**
 * 泛型 POST 请求
 * @param url 请求地址
 * @param data 请求体
 * @param config 额外配置
 */
export function post<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<ApiResponse<T>>> {
  return http.post<ApiResponse<T>>(url, data, config);
}

/**
 * 泛型 PUT 请求
 */
export function put<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<ApiResponse<T>>> {
  return http.put<ApiResponse<T>>(url, data, config);
}

/**
 * 泛型 DELETE 请求
 */
export function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<ApiResponse<T>>> {
  return http.delete<ApiResponse<T>>(url, config);
}

export default http;
