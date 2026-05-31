import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function uploadResume(payload) {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('summary', payload.summary || '');
    formData.append('isDefault', String(Boolean(payload.isDefault)));
    formData.append('isPublic', String(Boolean(payload.isPublic)));
    payload.skillIds.forEach((id) => formData.append('skillIds', id));
    formData.append('file', payload.file);
    const response = await apiClient.post('/resume', formData, {headers: {'Content-Type': 'multipart/form-data'}});
    return unwrapResult(response);
}

export async function updateResume(id, payload) {
    const response = await apiClient.put(`/resume/${id}`, payload);
    return unwrapResult(response);
}

export async function replaceResumeFile(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.put(`/resume/${id}/file`, formData, {headers: {'Content-Type': 'multipart/form-data'}});
    return unwrapResult(response);
}

export async function deleteResume(id) {
    const response = await apiClient.delete(`/resume/${id}`);
    return unwrapResult(response);
}

export async function getResumeById(id) {
    const response = await apiClient.get(`/resume/${id}`);
    return unwrapResult(response);
}

export async function getMyResumes(params = {}) {
    const response = await apiClient.get('/resume/me', {params});
    return unwrapResult(response);
}

export async function getAdminResumes(params = {}) {
    const response = await apiClient.get('/resume/admin', {params});
    return unwrapResult(response);
}

export async function setDefaultResume(id) {
    const response = await apiClient.put(`/resume/${id}/default`);
    return unwrapResult(response);
}

export async function getResumeDownload(id) {
    const response = await apiClient.get(`/resume/${id}/download`);
    return unwrapResult(response);
}

export async function getCandidateResume(jobId, candidateId) {
    const response = await apiClient.get(`/job/${jobId}/candidates/${candidateId}/resume`);
    return unwrapResult(response);
}

export async function getCandidateResumeDownload(jobId, candidateId) {
    const response = await apiClient.get(`/job/${jobId}/candidates/${candidateId}/resume/download`);
    return unwrapResult(response);
}
