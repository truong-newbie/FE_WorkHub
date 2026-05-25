import {useCallback, useEffect, useMemo, useState} from 'react';
import {jwtDecode} from 'jwt-decode';
import {completeOAuthCallback, loginApi, logoutApi} from '../services/authApi';
import {
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    setUserId,
    setAccessToken,
    setRefreshToken,
} from '../lib/tokenStorage';
import {AuthContext} from './authContext.js';

function decodeUserFromToken(token) {
    if (!token) {
        return null;
    }

    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Invalid auth token:', error);
        return null;
    }
}

function normalizeRole(role) {
    if (!role) {
        return '';
    }

    const value = typeof role === 'string' ? role : role.authority;
    return value?.replace(/^ROLE_/, '').toUpperCase() || '';
}

function normalizeRoles(authUser, loginResult) {
    const rawRoles = loginResult?.authorities
        || loginResult?.role
        || authUser?.authorities
        || authUser?.roles
        || authUser?.role
        || authUser?.auth
        || [];
    const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    return roles.map(normalizeRole).filter(Boolean);
}

export function AuthProvider({children}) {
    const [accessToken, setAccessTokenState] = useState(() => getAccessToken());
    const [refreshToken, setRefreshTokenState] = useState(() => getRefreshToken());
    const [user, setUser] = useState(() => decodeUserFromToken(getAccessToken()));
    const [role, setRole] = useState(() => normalizeRoles(decodeUserFromToken(getAccessToken()))[0] || '');
    const [isLoading, setIsLoading] = useState(false);

    const isAuthenticated = Boolean(accessToken);
    const roles = useMemo(() => {
        const normalized = normalizeRoles(user);
        return normalized.length > 0 ? normalized : role ? [role] : [];
    }, [role, user]);

    const loginSuccess = useCallback((authResult) => {
        const nextAccessToken = authResult?.accessToken || authResult?.token;
        const nextRefreshToken = authResult?.refreshToken || '';

        if (!nextAccessToken) {
            throw new Error('Access token is missing in auth response');
        }

        const decodedUser = decodeUserFromToken(nextAccessToken);
        const nextRoles = normalizeRoles(decodedUser, authResult);
        const nextRole = nextRoles[0] || '';
        const nextUserId = authResult?.userId || authResult?.id || decodedUser?.id || decodedUser?.sub;

        setAccessToken(nextAccessToken);
        setAccessTokenState(nextAccessToken);
        setUserId(nextUserId);

        if (nextRefreshToken) {
            setRefreshToken(nextRefreshToken);
            setRefreshTokenState(nextRefreshToken);
        }

        setUser({
            ...decodedUser,
            id: nextUserId,
            authorities: authResult?.authorities || decodedUser?.authorities || authResult?.role,
        });
        setRole(nextRole);

        return {role: nextRole, roles: nextRoles};
    }, []);

    const hydrateAuthFromStorage = useCallback(() => {
        const storedAccessToken = getAccessToken();
        const storedRefreshToken = getRefreshToken();
        const decodedUser = decodeUserFromToken(storedAccessToken);
        const hydratedRoles = normalizeRoles(decodedUser);

        setAccessTokenState(storedAccessToken);
        setRefreshTokenState(storedRefreshToken);
        setUser(decodedUser);
        setRole(hydratedRoles[0] || '');
    }, []);

    const login = useCallback(async ({email, password}) => {
        setIsLoading(true);

        try {
            const result = await loginApi({email, password});
            const authState = loginSuccess(result);
            return {...result, ...authState};
        } finally {
            setIsLoading(false);
        }
    }, [loginSuccess]);

    const completeOAuthLogin = useCallback(async ({code, state}) => {
        setIsLoading(true);

        try {
            const result = await completeOAuthCallback({code, state});
            const authState = loginSuccess(result);
            return {...result, ...authState};
        } finally {
            setIsLoading(false);
        }
    }, [loginSuccess]);

    const clearSession = useCallback(() => {
        clearAuthTokens();
        setAccessTokenState(null);
        setRefreshTokenState(null);
        setRole('');
        setUser(null);
    }, []);

    const logout = useCallback(async () => {
        try {
            if (getAccessToken()) {
                await logoutApi();
            }
        } catch (error) {
            console.error('Logout API failed:', error);
        } finally {
            clearSession();
        }
    }, [clearSession]);

    useEffect(() => {
        const handleUnauthorized = () => clearSession();
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [clearSession]);

    const value = useMemo(() => ({
        token: accessToken,
        accessToken,
        refreshToken,
        user,
        role,
        roles,
        isAuthenticated,
        isLoading,
        login,
        loginSuccess,
        completeOAuthLogin,
        logout,
        clearSession,
        hydrateAuthFromStorage,
    }), [
        accessToken,
        refreshToken,
        user,
        role,
        roles,
        isAuthenticated,
        isLoading,
        login,
        loginSuccess,
        completeOAuthLogin,
        logout,
        clearSession,
        hydrateAuthFromStorage,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
