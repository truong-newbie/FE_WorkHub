import {Navigate, Outlet, useLocation} from 'react-router-dom';
import LoadingState from '../components/ui/LoadingState.jsx';
import {useAuth} from '../stores/useAuth.js';

export default function ProtectedRoute() {
    const {isAuthenticated, isLoading} = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingState label="Checking session..."/>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>;
    }

    return <Outlet/>;
}
