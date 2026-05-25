import axios from 'axios';
import {env} from '../config/env';
import {clearAuthTokens, getAccessToken} from './tokenStorage';

export const apiClient = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const message = typeof data === 'string'
            ? data
            : data?.message || data?.error || error.message || 'Request failed';

        if (status === 401) {
            clearAuthTokens();
            window.dispatchEvent(new Event('auth:unauthorized'));
        }

        return Promise.reject({
            message,
            status,
            details: data,
            originalError: error,
        });
    },
);

export function unwrapResult(response) {
    return response.data?.data ?? response.data?.result ?? response.data;
}
