import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function searchSkills(params = {}) {
    const response = await apiClient.get('/skills', {params});
    return unwrapResult(response);
}

export async function getSkillById(id) {
    const response = await apiClient.get(`/skills/${id}`);
    return unwrapResult(response);
}

export async function getSkillSuggestions(params = {}) {
    const response = await apiClient.get('/skills/suggestions', {params});
    return unwrapResult(response);
}

export async function getPopularSkills(params = {}) {
    const response = await apiClient.get('/skills/popular', {params});
    return unwrapResult(response);
}

export async function createSkill(payload) {
    const response = await apiClient.post('/skills', payload);
    return unwrapResult(response);
}

export async function updateSkill(id, payload) {
    const response = await apiClient.put(`/skills/${id}`, payload);
    return unwrapResult(response);
}

export async function enableSkill(id) {
    const response = await apiClient.patch(`/skills/${id}/enable`);
    return unwrapResult(response);
}

export async function disableSkill(id) {
    const response = await apiClient.patch(`/skills/${id}/disable`);
    return unwrapResult(response);
}

export async function deleteSkill(id) {
    const response = await apiClient.delete(`/skills/${id}`);
    return unwrapResult(response);
}
