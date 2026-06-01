import {Navigate, Outlet, useLocation} from 'react-router-dom';
import LoadingState from '../components/ui/LoadingState.jsx';
import {useAuth} from '../stores/useAuth.js';

export default function RoleBasedRoute({allowedRoles = []}) {
    const {isAuthenticated, isLoading, roles} = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingState label="Checking permissions..."/>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>;
    }

    const normalizedAllowedRoles = allowedRoles.map((role) => role.replace(/^ROLE_/, '').toUpperCase());

    if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.some((role) => roles.includes(role))) {
        return <Navigate to="/unauthorized" replace/>;
    }

    return <Outlet/>;
}
