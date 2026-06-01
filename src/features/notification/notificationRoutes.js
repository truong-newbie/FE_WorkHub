export function getNotificationRoute(notification) {
    const id = notification?.targetId;
    if (!id) return null;

    if (notification.targetType === 'JOB') return `/jobs/${id}`;
    if (notification.targetType === 'COMPANY') return `/companies/${id}`;
    if (notification.type === 'JOB_APPLICATION_STATUS_UPDATED' && notification.targetType === 'APPLICATION') return '/applications';
    if (notification.type === 'JOB_APPLICATION_CREATED' && notification.targetType === 'APPLICATION') return '/recruiter/jobs';
    if (notification.type === 'ASSESSMENT_ASSIGNED' && notification.targetType === 'ASSESSMENT') return `/candidate/assessments/${id}/take`;
    if (notification.type === 'ASSESSMENT_SUBMITTED' && notification.targetType === 'ASSESSMENT') return `/recruiter/assessments/assignments/${id}/answers`;
    if (notification.type === 'ATS_SCREENING_COMPLETED' && notification.targetType === 'SCREENING_RESULT') return '/recruiter/jobs';

    return null;
}

const NOTIFICATION_TYPE_LABELS = {
    JOB_APPLICATION_CREATED: 'New application',
    JOB_APPLICATION_STATUS_UPDATED: 'Application update',
    ASSESSMENT_ASSIGNED: 'Assessment assigned',
    ASSESSMENT_SUBMITTED: 'Assessment submitted',
    COMPANY_APPROVED: 'Company approved',
    COMPANY_REJECTED: 'Company rejected',
    ATS_SCREENING_COMPLETED: 'ATS screening completed',
    SYSTEM: 'System',
};

export function getNotificationTypeLabel(type) {
    return NOTIFICATION_TYPE_LABELS[type] || type || 'Notification';
}
