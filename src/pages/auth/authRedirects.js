import {getCandidateOnboardingStatus} from '../../features/recommendation/services/recommendationService.js';

export function getRoleRedirectPath(role) {
    const normalizedRole = role?.replace(/^ROLE_/, '').toUpperCase();

    switch (normalizedRole) {
        case 'ADMIN':
            return '/admin/dashboard';
        case 'RECRUITER':
            return '/recruiter/dashboard';
        case 'CANDIDATE':
            return '/candidate/dashboard';
        default:
            return '/candidate/dashboard';
    }
}

export async function getPostLoginRedirectPath(role, requestedPath = '') {
    if (requestedPath) return requestedPath;
    const normalizedRole = role?.replace(/^ROLE_/, '').toUpperCase();
    if (normalizedRole === 'CANDIDATE') {
        try {
            const status = await getCandidateOnboardingStatus();
            if (status.requiredPreference || !status.hasJobPreference) return '/candidate/job-preference';
        } catch {
            // Login must remain usable if the optional onboarding check is unavailable.
        }
    }
    return getRoleRedirectPath(role);
}
