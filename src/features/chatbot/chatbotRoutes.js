const EXACT_ROUTE_ALIASES = {
    '/jobs/search': '/jobs',
    '/jobs/favorites': '/saved-jobs',
    '/applications/me': '/applications',
    '/resumes': '/candidate/resumes',
};

export function getChatbotRoute(url = '') {
    if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) {
        return null;
    }

    if (EXACT_ROUTE_ALIASES[url]) {
        return EXACT_ROUTE_ALIASES[url];
    }

    if (/^\/resumes\/\d+$/.test(url)) {
        return '/candidate/resumes';
    }

    return url;
}
