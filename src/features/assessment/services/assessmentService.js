import { apiClient, unwrapResult } from '../../../lib/apiClient';

export async function createAssessment(jobId, payload) {
  return unwrapResult(await apiClient.post(`/recruiter/jobs/${jobId}/tests`, payload));
}

export async function updateAssessment(testId, payload) {
  return unwrapResult(await apiClient.put(`/recruiter/tests/${testId}`, payload));
}

export async function deleteAssessment(testId) {
  return unwrapResult(await apiClient.delete(`/recruiter/tests/${testId}`));
}

export async function publishAssessment(testId) {
  return unwrapResult(await apiClient.put(`/recruiter/tests/${testId}/publish`));
}

export async function closeAssessment(testId) {
  return unwrapResult(await apiClient.put(`/recruiter/tests/${testId}/close`));
}

export async function createAssessmentQuestion(testId, payload) {
  return unwrapResult(await apiClient.post(`/recruiter/tests/${testId}/questions`, payload));
}

export async function updateAssessmentQuestion(questionId, payload) {
  return unwrapResult(await apiClient.put(`/recruiter/questions/${questionId}`, payload));
}

export async function deleteAssessmentQuestion(questionId) {
  return unwrapResult(await apiClient.delete(`/recruiter/questions/${questionId}`));
}

export async function assignAssessment(testId, payload) {
  return unwrapResult(await apiClient.post(`/recruiter/tests/${testId}/assign`, payload));
}

export async function getAssessmentAssignments(testId) {
  return unwrapResult(await apiClient.get(`/recruiter/tests/${testId}/assignments`));
}

export async function getAssessmentResults(testId) {
  return unwrapResult(await apiClient.get(`/recruiter/tests/${testId}/results`));
}

export async function getAssessmentAnswers(assignmentId) {
  return unwrapResult(await apiClient.get(`/recruiter/test-assignments/${assignmentId}/answers`));
}

export async function gradeAssessmentAnswer(answerId, payload) {
  return unwrapResult(await apiClient.put(`/recruiter/answers/${answerId}/score`, payload));
}

export async function getCandidateAssessments() {
  return unwrapResult(await apiClient.get('/candidate/tests'));
}

export async function getCandidateAssessmentDetail(assignmentId) {
  return unwrapResult(await apiClient.get(`/candidate/test-assignments/${assignmentId}`));
}

export async function startCandidateAssessment(assignmentId) {
  return unwrapResult(await apiClient.post(`/candidate/test-assignments/${assignmentId}/start`));
}

export async function submitCandidateAssessment(assignmentId, payload) {
  return unwrapResult(await apiClient.post(`/candidate/test-assignments/${assignmentId}/submit`, payload));
}

export async function getCandidateAssessmentResult(assignmentId) {
  return unwrapResult(await apiClient.get(`/candidate/test-assignments/${assignmentId}/result`));
}
