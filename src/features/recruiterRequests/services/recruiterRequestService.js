import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function createRecruiterUpgradeRequest(payload = {}) {
    const response = await apiClient.post('/recruiter-requests', payload);
    return unwrapResult(response);
}

export async function getMyRecruiterUpgradeRequests(params = {}) {
    const response = await apiClient.get('/recruiter-requests/me', {params});
    return unwrapResult(response);
}

export async function getRecruiterUpgradeRequests(params = {}) {
    const response = await apiClient.get('/recruiter-requests', {params});
    return unwrapResult(response);
}

export async function approveRecruiterUpgradeRequest(requestId, payload = {}) {
    const response = await apiClient.patch(`/recruiter-requests/${requestId}/approve`, payload);
    return unwrapResult(response);
}

export async function rejectRecruiterUpgradeRequest(requestId, payload = {}) {
    const response = await apiClient.patch(`/recruiter-requests/${requestId}/reject`, payload);
    return unwrapResult(response);
}

export async function createCompanyJoinRequest(companyId, payload) {
    const response = await apiClient.post(`/companies/${companyId}/join-requests`, payload);
    return unwrapResult(response);
}

export async function getMyCompanyJoinRequests(params = {}) {
    const response = await apiClient.get('/companies/join-requests/me', {params});
    return unwrapResult(response);
}

export async function getCompanyJoinRequests(companyId, params = {}) {
    const response = await apiClient.get(`/companies/${companyId}/join-requests`, {params});
    return unwrapResult(response);
}

export async function approveCompanyJoinRequest(requestId, payload = {}) {
    const response = await apiClient.patch(`/companies/join-requests/${requestId}/approve`, payload);
    return unwrapResult(response);
}

export async function rejectCompanyJoinRequest(requestId, payload = {}) {
    const response = await apiClient.patch(`/companies/join-requests/${requestId}/reject`, payload);
    return unwrapResult(response);
}
