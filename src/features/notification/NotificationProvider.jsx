import {useCallback, useEffect, useMemo, useState} from 'react';
import {useToast} from '../../components/ui/useToast.js';
import {useAuth} from '../../stores/useAuth.js';
import {getNotificationRoute} from './notificationRoutes.js';
import {NotificationContext} from './notificationContext.js';
import {createNotificationSocket} from './services/notificationSocket.js';
import {deleteNotification, getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead} from './services/notificationService.js';

const RECENT_PARAMS = {pageNum: 1, pageSize: 8, sortBy: 'createdAt', isAscending: false};
const REST_SYNC_INTERVAL_MS = 15000;

function prependUnique(current, notification) {
    return [notification, ...current.filter((item) => String(item.id) !== String(notification.id))].slice(0, 8);
}

export function NotificationProvider({children}) {
    const {accessToken, isAuthenticated} = useAuth();
    const {showToast} = useToast();
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [latestRealtimeId, setLatestRealtimeId] = useState('');

    const refreshUnreadCount = useCallback(async () => {
        if (!accessToken) return;
        const data = await getUnreadNotificationCount();
        setUnreadCount(Number(data?.unreadCount || 0));
    }, [accessToken]);

    const refreshRecentNotifications = useCallback(async () => {
        if (!accessToken) return;
        setIsLoading(true);
        try {
            const data = await getNotifications(RECENT_PARAMS);
            setRecentNotifications(data?.items || []);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load notifications.');
        } finally {
            setIsLoading(false);
        }
    }, [accessToken]);

    const syncNotifications = useCallback(() => {
        if (!accessToken) return;
        refreshUnreadCount().catch(() => {});
        refreshRecentNotifications().catch(() => {});
    }, [accessToken, refreshRecentNotifications, refreshUnreadCount]);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            setRecentNotifications([]);
            setUnreadCount(0);
            setIsConnected(false);
            setErrorMessage('');
            setLatestRealtimeId('');
            return undefined;
        }

        syncNotifications();
        const client = createNotificationSocket({
            accessToken,
            onConnect: () => {
                setIsConnected(true);
                setErrorMessage('');
                syncNotifications();
            },
            onDisconnect: () => setIsConnected(false),
            onError: (message) => {
                setIsConnected(false);
                setErrorMessage(message);
            },
            onNotification: (notification) => {
                setRecentNotifications((current) => prependUnique(current, notification));
                setLatestRealtimeId(String(notification.id));
                refreshUnreadCount().catch(() => {});
                const route = getNotificationRoute(notification);
                showToast({
                    message: `${notification.title}: ${notification.content}`,
                    type: 'info',
                    onClick: route ? () => window.location.assign(route) : undefined,
                });
            },
        });
        client.activate();

        const syncOnFocus = () => syncNotifications();
        const syncIntervalId = window.setInterval(syncNotifications, REST_SYNC_INTERVAL_MS);
        window.addEventListener('focus', syncOnFocus);
        return () => {
            window.clearInterval(syncIntervalId);
            window.removeEventListener('focus', syncOnFocus);
            void client.deactivate();
        };
    }, [accessToken, isAuthenticated, refreshUnreadCount, showToast, syncNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        const updated = await markNotificationAsRead(notificationId);
        setRecentNotifications((current) => current.map((item) => String(item.id) === String(notificationId) ? updated : item));
        await refreshUnreadCount();
        return updated;
    }, [refreshUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        await markAllNotificationsAsRead();
        setRecentNotifications((current) => current.map((item) => ({...item, read: true})));
        setUnreadCount(0);
    }, []);

    const removeNotification = useCallback(async (notificationId) => {
        await deleteNotification(notificationId);
        setRecentNotifications((current) => current.filter((item) => String(item.id) !== String(notificationId)));
        await refreshUnreadCount();
    }, [refreshUnreadCount]);

    const value = useMemo(() => ({
        recentNotifications,
        unreadCount,
        isLoading,
        isConnected,
        errorMessage,
        latestRealtimeId,
        refreshRecentNotifications,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
    }), [errorMessage, isConnected, isLoading, latestRealtimeId, markAllAsRead, markAsRead, recentNotifications, refreshRecentNotifications, refreshUnreadCount, removeNotification, unreadCount]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
