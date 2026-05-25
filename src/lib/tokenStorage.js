const TOKEN_KEY = 'accessToken';
const LEGACY_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';

export function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUserId() {
    return localStorage.getItem(USER_ID_KEY);
}

export function setAccessToken(token) {
    if (!token) {
        return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
}

export function setRefreshToken(token) {
    if (!token) {
        return;
    }

    localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setUserId(userId) {
    if (!userId) {
        return;
    }

    localStorage.setItem(USER_ID_KEY, userId);
}

export function clearAccessToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function clearAuthTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
}
