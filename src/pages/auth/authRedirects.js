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
