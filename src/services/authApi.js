import {apiClient, unwrapResult} from '../lib/apiClient';

export async function loginApi(payload) {
    const response = await apiClient.post('/auth/login', payload);
    return unwrapResult(response);
}

export async function registerApi(payload) {
    const response = await apiClient.post('/auth/register', payload);
    return unwrapResult(response);
}

export async function logoutApi() {
    const response = await apiClient.post('/auth/logout');
    return unwrapResult(response);
}

export async function getOAuthAuthorizeUrl(provider) {
    const response = await apiClient.get('/auth/oauth2/authorize', {
        params: {login_type: provider},
        responseType: 'text',
    });

    return response.data;
}

export async function completeOAuthCallback({code, state}) {
    const response = await apiClient.get('/auth/oauth2/callback', {
        params: {code, state},
    });

    return unwrapResult(response);
}
