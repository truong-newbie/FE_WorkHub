import {apiClient, unwrapResult} from '../../../lib/apiClient.js';

export async function queueApplicationScreening(applicationId) {
    const response = await apiClient.post(`/recruiter/applications/${applicationId}/screen`);
    return unwrapResult(response);
}

export async function getApplicationScreeningResult(applicationId) {
    const response = await apiClient.get(`/recruiter/applications/${applicationId}/screening-result`);
    return unwrapResult(response);
}

export async function getJobScreeningResults(jobId) {
    const response = await apiClient.get(`/recruiter/jobs/${jobId}/screening-results`);
    return unwrapResult(response);
}
