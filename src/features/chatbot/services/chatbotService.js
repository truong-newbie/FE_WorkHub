import { apiClient, unwrapResult } from '../../../lib/apiClient.js';

export async function sendChatMessage(payload) {
    return unwrapResult(await apiClient.post('/chat/messages', payload));
}

export async function getChatConversations(params = {}) {
    return unwrapResult(await apiClient.get('/chat/conversations', { params }));
}

export async function getChatMessages(conversationId, params = {}) {
    return unwrapResult(await apiClient.get(`/chat/conversations/${conversationId}/messages`, { params }));
}

export async function deleteChatConversation(conversationId) {
    return unwrapResult(await apiClient.delete(`/chat/conversations/${conversationId}`));
}
