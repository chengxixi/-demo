import axios from 'axios';
import type {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { message } from 'ant-design-vue';

/**
 * 统一请求实例
 * 包含请求/响应拦截、异常处理、错误提示
 */
const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
});

// 请求拦截
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 可在此注入 token
        // const token = localStorage.getItem('token');
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error),
);

// 响应拦截
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data } = response;
        if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
            message.error(data.message || '请求失败');
            return Promise.reject(new Error(data.message || '请求失败'));
        }
        return data;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const msgMap: Record<number, string> = {
                400: '请求参数有误',
                401: '登录已过期，请重新登录',
                403: '没有操作权限',
                404: '请求的资源不存在',
                500: '服务器内部错误',
            };
            message.error(msgMap[status] || `请求异常 (${status})`);
        } else if (error.code === 'ECONNABORTED') {
            message.error('请求超时，请重试');
        } else {
            message.error('网络异常，请检查网络连接');
        }
        return Promise.reject(error);
    },
);

/**
 * GET 请求
 */
export function get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
): Promise<T> {
    return instance.get(url, { params, ...config });
}

/**
 * POST 请求
 */
export function post<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig,
): Promise<T> {
    return instance.post(url, data, config);
}

/**
 * PUT 请求
 */
export function put<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig,
): Promise<T> {
    return instance.put(url, data, config);
}

/**
 * DELETE 请求
 */
export function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config);
}

export default instance;
