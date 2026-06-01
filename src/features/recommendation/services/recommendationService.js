import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function getCandidateOnboardingStatus(config = {}) {
    const response = await apiClient.get('/candidate/onboarding-status', config);
    return unwrapResult(response);
}

export async function getCandidateJobPreference() {
    const response = await apiClient.get('/candidate/job-preference');
    return unwrapResult(response);
}

export async function createCandidateJobPreference(payload) {
    const response = await apiClient.post('/candidate/job-preference', payload);
    return unwrapResult(response);
}

export async function updateCandidateJobPreference(payload) {
    const response = await apiClient.put('/candidate/job-preference', payload);
    return unwrapResult(response);
}

export async function getRecommendedJobs(params = {}) {
    const response = await apiClient.get('/candidate/jobs/recommended', {params});
    return unwrapResult(response);
}

export async function trackJobView(jobId, payload = {source: 'JOB_DETAIL'}) {
    const response = await apiClient.post(`/candidate/jobs/${jobId}/view`, payload, {skipAuthCleanup: true});
    return unwrapResult(response);
}

export async function trackJobClick(jobId, payload = {source: 'RECOMMENDATION'}) {
    const response = await apiClient.post(`/candidate/jobs/${jobId}/click`, payload, {skipAuthCleanup: true});
    return unwrapResult(response);
}

export async function trackJobSearch(payload) {
    const response = await apiClient.post('/candidate/jobs/search-track', payload, {skipAuthCleanup: true});
    return unwrapResult(response);
}
