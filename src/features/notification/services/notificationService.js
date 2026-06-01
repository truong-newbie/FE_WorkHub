import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function getNotifications(params = {}) {
    const response = await apiClient.get('/notifications', {params});
    return unwrapResult(response);
}

export async function getUnreadNotificationCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return unwrapResult(response);
}

export async function markNotificationAsRead(notificationId) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return unwrapResult(response);
}

export async function markAllNotificationsAsRead() {
    const response = await apiClient.put('/notifications/read-all');
    return unwrapResult(response);
}

export async function deleteNotification(notificationId) {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return unwrapResult(response);
}
