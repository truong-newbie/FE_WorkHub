import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import {useAuth} from '../../stores/useAuth.js';
import {useToast} from '../../components/ui/useToast.js';
import {getRoleRedirectPath} from './authRedirects.js';
import styles from './AuthPage.module.css';

export default function OAuthCallbackPage() {
    const [errorMessage, setErrorMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {loginSuccess} = useAuth();
    const {showToast} = useToast();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');
        const error = searchParams.get('error');

        if (error) {
            navigate(`/login?error=${encodeURIComponent(error)}`, {replace: true});
            return;
        }

        if (!accessToken || !refreshToken) {
            navigate('/login?error=oauth_missing_token', {replace: true});
            return;
        }

        try {
            const result = loginSuccess({accessToken, refreshToken, userId, role});
            showToast({message: 'Logged in successfully', type: 'success'});
            navigate(getRoleRedirectPath(result.role || role), {replace: true});
        } catch (callbackError) {
            const message = callbackError.message || 'OAuth login failed';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        }
    }, [loginSuccess, navigate, searchParams, showToast]);

    return (
        <main className={styles.authPage}>
            <section className={styles.panel}>
                {errorMessage ? <ErrorMessage message={errorMessage}/> : <LoadingState label="Completing login..."/>}
            </section>
        </main>
    );
}
