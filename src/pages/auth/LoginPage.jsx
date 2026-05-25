import {useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import Input from '../../components/ui/Input.jsx';
import {getOAuthAuthorizeUrl} from '../../services/authApi.js';
import {useAuth} from '../../stores/useAuth.js';
import {useToast} from '../../components/ui/useToast.js';
import {getRoleRedirectPath} from './authRedirects.js';
import styles from './AuthPage.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [oauthProvider, setOauthProvider] = useState('');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {login, isLoading} = useAuth();
    const {showToast} = useToast();

    const handleLogin = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        try {
            const result = await login({email, password});
            showToast({message: 'Logged in successfully', type: 'success'});
            navigate(getRoleRedirectPath(result.role), {replace: true});
        } catch (error) {
            const message = error.message || 'Login failed';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        }
    };

    const handleOAuthLogin = async (provider) => {
        setErrorMessage('');
        setOauthProvider(provider);

        try {
            const authUrl = await getOAuthAuthorizeUrl(provider);

            if (!authUrl) {
                throw new Error('OAuth authorization URL is missing');
            }

            window.location.assign(authUrl);
        } catch (error) {
            const message = error.message || `${provider} login failed`;
            setErrorMessage(message);
            showToast({message, type: 'error'});
            setOauthProvider('');
        }
    };

    return (
        <main className={styles.authPage}>
            <section className={styles.panel}>
                <div className={styles.header}>
                    <h1>WorkHub Login</h1>
                    <p>Use your WorkHub account to continue.</p>
                </div>

                <form className={styles.form} onSubmit={handleLogin}>
                    <ErrorMessage message={searchParams.get('error')}/>
                    <Input
                        className={styles.field}
                        label="Email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                    <Input
                        className={styles.field}
                        label="Password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                    <ErrorMessage message={errorMessage}/>
                    <Button className={styles.fullWidth} type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </Button>
                </form>

                <div className={styles.divider}>or</div>

                <div className={styles.socialActions}>
                    <Button
                        className={styles.fullWidth}
                        variant="secondary"
                        disabled={Boolean(oauthProvider)}
                        onClick={() => handleOAuthLogin('google')}
                    >
                        {oauthProvider === 'google' ? 'Opening Google...' : 'Continue with Google'}
                    </Button>
                    <Button
                        className={styles.fullWidth}
                        variant="secondary"
                        disabled={Boolean(oauthProvider)}
                        onClick={() => handleOAuthLogin('facebook')}
                    >
                        {oauthProvider === 'facebook' ? 'Opening Facebook...' : 'Continue with Facebook'}
                    </Button>
                </div>

                <p className={styles.footer}>
                    Do not have an account? <Link to="/register">Register</Link>
                </p>
            </section>
        </main>
    );
}
