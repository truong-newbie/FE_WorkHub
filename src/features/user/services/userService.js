import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function createUser(payload) {
    const response = await apiClient.post('/user', payload);
    return unwrapResult(response);
}

export async function getUsers(params = {}) {
    const response = await apiClient.get('/user', {params});
    return unwrapResult(response);
}

export async function getUserById(id) {
    const response = await apiClient.get(`/user/${id}`);
    return unwrapResult(response);
}

export async function updateUserById(id, payload) {
    const response = await apiClient.put(`/user/${id}`, payload);
    return unwrapResult(response);
}

export const updateProfile = updateUserById;

export async function deleteUser(id) {
    const response = await apiClient.delete(`/user/${id}`);
    return unwrapResult(response);
}

export async function lockUser(id, payload) {
    const response = await apiClient.put(`/user/${id}/lock`, payload);
    return unwrapResult(response);
}

export async function unlockUser(id, payload) {
    const response = await apiClient.put(`/user/${id}/unlock`, payload);
    return unwrapResult(response);
}

export async function changeUserRole(id, payload) {
    const response = await apiClient.put(`/user/${id}/role`, payload);
    return unwrapResult(response);
}

export async function getUserStatistics() {
    const response = await apiClient.get('/user/statistics');
    return unwrapResult(response);
}

export async function getCurrentUserProfile() {
    const response = await apiClient.get('/user/me/profile');
    return unwrapResult(response);
}

export async function updateCurrentUserProfile(payload) {
    const response = await apiClient.put('/user/me/profile', payload);
    return unwrapResult(response);
}

export async function changeCurrentUserPassword(payload) {
    const response = await apiClient.put('/user/me/password', payload);
    return unwrapResult(response);
}

export async function updateCurrentUserAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.put('/user/me/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return unwrapResult(response);
}
