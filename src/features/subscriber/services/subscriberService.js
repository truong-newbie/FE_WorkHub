import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function createSubscriber(payload) {
    const response = await apiClient.post('/subscribers', payload);
    return unwrapResult(response);
}

export async function getMySubscriber() {
    const response = await apiClient.get('/subscribers/me');
    return unwrapResult(response);
}

export async function getSubscriberById(id) {
    const response = await apiClient.get(`/subscribers/${id}`);
    return unwrapResult(response);
}

export async function updateSubscriber(id, payload) {
    const response = await apiClient.put(`/subscribers/${id}`, payload);
    return unwrapResult(response);
}

export async function deleteSubscriber(id) {
    const response = await apiClient.delete(`/subscribers/${id}`);
    return unwrapResult(response);
}

export async function enableSubscriber(id) {
    const response = await apiClient.put(`/subscribers/${id}/enable`);
    return unwrapResult(response);
}

export async function disableSubscriber(id) {
    const response = await apiClient.put(`/subscribers/${id}/disable`);
    return unwrapResult(response);
}

export async function searchSubscribers(params = {}) {
    const response = await apiClient.get('/subscribers', {params});
    return unwrapResult(response);
}

export async function sendSubscriberMail() {
    const response = await apiClient.post('/subscribers/mail/send');
    return unwrapResult(response);
}

export async function processSubscriberMailQueue() {
    const response = await apiClient.post('/subscribers/mail/queue/process');
    return unwrapResult(response);
}

export async function unsubscribeSubscriber(token) {
    const response = await apiClient.get('/subscribers/unsubscribe', {params: {token}});
    return unwrapResult(response);
}
