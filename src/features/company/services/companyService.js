import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function searchCompanies(params = {}, config = {}) {
    const response = await apiClient.get('/companies', {...config, params});
    return unwrapResult(response);
}

export async function getCompanyById(id, config = {}) {
    const response = await apiClient.get(`/companies/${id}`, config);
    return unwrapResult(response);
}

export async function getCurrentCompany() {
    const response = await apiClient.get('/companies/me');
    return unwrapResult(response);
}

export async function createCompany(payload) {
    const response = await apiClient.post('/companies', payload);
    return unwrapResult(response);
}

export async function updateCompany(id, payload) {
    const response = await apiClient.put(`/companies/${id}`, payload);
    return unwrapResult(response);
}

export async function updateCurrentCompany(payload) {
    const response = await apiClient.put('/companies/me', payload);
    return unwrapResult(response);
}

export async function uploadCompanyLogo(id, file) {
    return uploadCompanyImage(id, 'logo', file);
}

export async function uploadCompanyCover(id, file) {
    return uploadCompanyImage(id, 'cover', file);
}

async function uploadCompanyImage(id, type, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/companies/${id}/${type}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    });
    return unwrapResult(response);
}

export async function enableCompany(id) {
    const response = await apiClient.patch(`/companies/${id}/enable`);
    return unwrapResult(response);
}

export async function disableCompany(id) {
    const response = await apiClient.patch(`/companies/${id}/disable`);
    return unwrapResult(response);
}

export async function approveCompany(id) {
    const response = await apiClient.patch(`/companies/${id}/approve`);
    return unwrapResult(response);
}

export async function rejectCompany(id) {
    const response = await apiClient.patch(`/companies/${id}/reject`);
    return unwrapResult(response);
}

export async function getCompanyJobs(id, params = {}, config = {}) {
    const response = await apiClient.get(`/companies/${id}/jobs`, {...config, params});
    return unwrapResult(response);
}

export async function getCompanyStatistics(id) {
    const response = await apiClient.get(`/companies/${id}/statistics`);
    return unwrapResult(response);
}

export async function deleteCompany(id) {
    const response = await apiClient.delete(`/companies/${id}`);
    return unwrapResult(response);
}
