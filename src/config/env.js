export const env = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    webSocketUrl: import.meta.env.VITE_WEBSOCKET_URL || '/ws',
    appEnv: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
};
