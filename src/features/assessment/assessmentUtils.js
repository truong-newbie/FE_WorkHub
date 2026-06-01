import {getUserId} from '../../lib/tokenStorage';

const SNAPSHOT_KEY = 'workhub.recruiter-assessment-snapshots';

function getSnapshotKey() {
  return `${SNAPSHOT_KEY}:${getUserId() || 'anonymous'}`;
}

export const TEST_STATUSES = ['DRAFT', 'PUBLISHED', 'CLOSED'];
export const ASSIGNMENT_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED'];
export const QUESTION_TYPES = ['MULTIPLE_CHOICE', 'ESSAY'];

export function readAssessmentSnapshots() {
  try {
    const value = JSON.parse(window.localStorage.getItem(getSnapshotKey()) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function getAssessmentSnapshot(testId) {
  return readAssessmentSnapshots().find((test) => String(test.id) === String(testId)) || null;
}

export function saveAssessmentSnapshot(test) {
  if (!test?.id) return test;
  const snapshots = readAssessmentSnapshots();
  const index = snapshots.findIndex((item) => String(item.id) === String(test.id));
  if (index >= 0) snapshots[index] = test;
  else snapshots.unshift(test);
  window.localStorage.setItem(getSnapshotKey(), JSON.stringify(snapshots));
  return test;
}

export function removeAssessmentSnapshot(testId) {
  const snapshots = readAssessmentSnapshots().filter((test) => String(test.id) !== String(testId));
  window.localStorage.setItem(getSnapshotKey(), JSON.stringify(snapshots));
}

export function getAssessmentBasePath(pathname = '') {
  return pathname.startsWith('/admin') ? '/admin/assessments' : '/recruiter/assessments';
}

export function getAssessmentJobsPath(pathname = '') {
  return pathname.startsWith('/admin') ? '/admin/jobs' : '/recruiter/jobs';
}

export function formatDateTime(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function formatScore(score, maxScore) {
  return `${score ?? 'Pending'} / ${maxScore ?? 0}`;
}

export function toDateTimeLocal(value) {
  return value ? String(value).slice(0, 16) : '';
}

function withSeconds(value) {
  return value?.length === 16 ? `${value}:00` : value;
}

export function buildAssessmentPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    durationMinutes: Number(form.durationMinutes),
    startAt: withSeconds(form.startAt),
    endAt: withSeconds(form.endAt),
  };
}

export function validateAssessmentForm(form) {
  if (!form.title.trim()) return 'Title is required.';
  if (!Number(form.durationMinutes) || Number(form.durationMinutes) <= 0) return 'Duration must be greater than zero.';
  if (!form.startAt || !form.endAt) return 'Start and end time are required.';
  if (new Date(form.endAt) <= new Date(form.startAt)) return 'End time must be after start time.';
  return '';
}

export function getAssignmentDeadline(assignment) {
  if (!assignment?.startedAt) return null;
  const durationDeadline = new Date(assignment.startedAt).getTime() + Number(assignment.durationMinutes || 0) * 60_000;
  const windowDeadline = assignment.testEndAt ? new Date(assignment.testEndAt).getTime() : durationDeadline;
  return Math.min(durationDeadline, windowDeadline);
}

export function formatRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((value) => String(value).padStart(2, '0')).join(':');
}

export function statusTone(status) {
  if (['PUBLISHED', 'SUBMITTED'].includes(status)) return 'success';
  if (['CLOSED', 'EXPIRED'].includes(status)) return 'danger';
  if (status === 'IN_PROGRESS') return 'warning';
  return 'neutral';
}
