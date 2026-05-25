import {apiClient, unwrapResult} from '../lib/apiClient';

export async function getCurrentUser() {
    const response = await apiClient.get('/user');
    return unwrapResult(response);
}

export async function getUserById(id) {
    const response = await apiClient.get(`/user/id/${id}`);
    return unwrapResult(response);
}

export async function updateUser(payload) {
    const response = await apiClient.put('/user', payload);
    return unwrapResult(response);
}

export async function uploadAvatar(formData) {
    const response = await apiClient.post('/user/upload_avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return unwrapResult(response);
}

export async function followUser(payload) {
    const response = await apiClient.post('/user/follow', payload);
    return unwrapResult(response);
}

export async function unfollowUser(payload) {
    const response = await apiClient.post('/user/unfollow', payload);
    return unwrapResult(response);
}

export async function checkUserFollowing({myId, targetId}) {
    const response = await apiClient.get('/user/follow/check-follow', {
        params: {myId, targetId},
    });

    return unwrapResult(response);
}

export async function getFollowList({id, isFollower}) {
    const response = await apiClient.get('/user/follow/show-follow', {
        params: {id, isFollower},
    });

    return unwrapResult(response);
}

export async function searchUsers(keyword) {
    const response = await apiClient.get(`/user/search/${encodeURIComponent(keyword)}`);
    return unwrapResult(response);
}
