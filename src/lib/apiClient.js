import axios from 'axios';
import {env} from '../config/env';
import {clearAuthTokens, getAccessToken} from './tokenStorage';

function getErrorMessage(data, fallback) {
    if (typeof data === 'string') {
        return data;
    }

    const responseMessage = data?.message;

    if (typeof responseMessage === 'string') {
        return responseMessage;
    }

    if (responseMessage && typeof responseMessage === 'object') {
        return responseMessage.message
            || Object.entries(responseMessage).map(([field, message]) => `${field}: ${message}`).join(', ');
    }

    return (typeof data?.error === 'string' ? data.error : data?.error?.message) || fallback || 'Request failed';
}

export const apiClient = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token && !config.skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const message = getErrorMessage(data, error.message);
        const requestAuthorization = error.config?.headers?.Authorization
            || error.config?.headers?.get?.('Authorization');
        const currentToken = getAccessToken();
        const requestUsedCurrentToken = currentToken && requestAuthorization === `Bearer ${currentToken}`;

        if (status === 401 && !error.config?.skipAuthCleanup && requestUsedCurrentToken) {
            clearAuthTokens();
            window.dispatchEvent(new Event('auth:unauthorized'));
            if (window.location.pathname !== '/login') {
                window.location.assign('/login');
            }
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
