import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {env} from '../../../config/env.js';

function parseNotification(body) {
    try {
        const notification = JSON.parse(body);
        return notification && notification.id ? notification : null;
    } catch {
        return null;
    }
}

export function createNotificationSocket({accessToken, onConnect, onDisconnect, onError, onNotification}) {
    const socketUrl = new URL(env.webSocketUrl, window.location.origin);
    socketUrl.searchParams.set('token', accessToken);

    const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl.toString()),
        connectHeaders: {
            Authorization: `Bearer ${accessToken}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => {},
    });

    client.onConnect = () => {
        onConnect?.();
        client.subscribe('/user/queue/notifications', (message) => {
            const notification = parseNotification(message.body);
            if (notification) onNotification?.(notification);
        });
    };
    client.onDisconnect = () => onDisconnect?.();
    client.onWebSocketClose = () => onDisconnect?.();
    client.onStompError = () => onError?.('Realtime notification connection failed.');
    client.onWebSocketError = () => onError?.('Realtime notification connection failed.');

    return client;
}
