import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function getLatestJobs(params = {}) {
    const response = await apiClient.get('/jobs/latest', {params, skipAuth: true, skipAuthCleanup: true});
    return unwrapResult(response);
}

export async function searchJobs(params = {}) {
    const response = await apiClient.get('/jobs/search', {params});
    return unwrapResult(response);
}

export async function getJobAutocomplete(params = {}) {
    const response = await apiClient.get('/jobs/search/autocomplete', {params});
    return unwrapResult(response);
}

export async function getJobs(params = {}) {
    const response = await apiClient.get('/job', {params});
    return unwrapResult(response);
}

export async function getJobById(id, config = {}) {
    const response = await apiClient.get(`/job/${id}`, config);
    return unwrapResult(response);
}

export async function createJob(payload) {
    const response = await apiClient.post('/job', payload);
    return unwrapResult(response);
}

export async function updateJob(id, payload) {
    const response = await apiClient.put(`/job/${id}`, payload);
    return unwrapResult(response);
}

export async function publishJob(id) {
    const response = await apiClient.put(`/job/${id}/publish`);
    return unwrapResult(response);
}

export async function unpublishJob(id) {
    const response = await apiClient.put(`/job/${id}/unpublish`);
    return unwrapResult(response);
}

export async function deleteJob(id) {
    const response = await apiClient.delete(`/job/${id}`);
    return unwrapResult(response);
}

export async function getJobStatistics() {
    const response = await apiClient.get('/job/statistics');
    return unwrapResult(response);
}

export async function reindexJobSearch() {
    const response = await apiClient.post('/jobs/search/reindex');
    return unwrapResult(response);
}

export async function saveJob(jobId) {
    const response = await apiClient.post(`/job/${jobId}/favorite`);
    return unwrapResult(response);
}

export async function unsaveJob(jobId) {
    const response = await apiClient.delete(`/job/${jobId}/favorite`);
    return unwrapResult(response);
}

export async function getSavedJobs(params = {}, config = {}) {
    const response = await apiClient.get('/jobs/favorites', {...config, params});
    return unwrapResult(response);
}

export async function applyJob(jobId, payload) {
    const response = await apiClient.post(`/job/${jobId}/apply`, payload);
    return unwrapResult(response);
}

export async function withdrawJobApplication(jobId) {
    const response = await apiClient.delete(`/job/${jobId}/apply`);
    return unwrapResult(response);
}

export async function getMyApplications(params = {}, config = {}) {
    const response = await apiClient.get('/applications/me', {...config, params});
    return unwrapResult(response);
}

export async function getJobApplications(jobId, params = {}) {
    const response = await apiClient.get(`/job/${jobId}/applications`, {params});
    return unwrapResult(response);
}

export async function updateApplicationStatus(applicationId, payload) {
    const response = await apiClient.put(`/applications/${applicationId}/status`, payload);
    return unwrapResult(response);
}
