import {apiClient, unwrapResult} from '../lib/apiClient';

export async function loginApi(payload) {
    const response = await apiClient.post('/auth/login', payload, {skipAuth: true, skipAuthCleanup: true});
    return unwrapResult(response);
}

export async function registerApi(payload) {
    const response = await apiClient.post('/auth/register', payload, {skipAuth: true, skipAuthCleanup: true});
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
        skipAuth: true,
        skipAuthCleanup: true,
    });

    return response.data;
}

export async function completeOAuthCallback({code, state}) {
    const response = await apiClient.get('/auth/oauth2/callback', {
        params: {code, state},
        skipAuth: true,
        skipAuthCleanup: true,
    });

    return unwrapResult(response);
}

export async function forgotPassword(payload) {
    const response = await apiClient.post(`/forgot-password/email-verification/${encodeURIComponent(payload.email)}`, null, {skipAuth: true, skipAuthCleanup: true});
    return unwrapResult(response);
}

export async function verifyForgotPasswordOtp(payload) {
    const response = await apiClient.post('/forgot-password/otp-verification', {
        email: payload.email,
        otp: Number(payload.otp),
    }, {skipAuth: true, skipAuthCleanup: true});
    return unwrapResult(response);
}

export async function resetPassword(payload) {
    const response = await apiClient.post(`/forgot-password/password-update/${encodeURIComponent(payload.email)}`, {
        password: payload.password,
        repeatPassword: payload.repeatPassword,
    }, {skipAuth: true, skipAuthCleanup: true});
    return unwrapResult(response);
}
