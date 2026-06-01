import {useState} from 'react';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {FaCheckCircle, FaBriefcase, FaUsers, FaRocket} from 'react-icons/fa';
import {FcGoogle} from 'react-icons/fc';
import {FaFacebook} from 'react-icons/fa';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import {getOAuthAuthorizeUrl} from '../../services/authApi.js';
import {useAuth} from '../../stores/useAuth.js';
import {useToast} from '../../components/ui/useToast.js';
import {getPostLoginRedirectPath} from './authRedirects.js';
import styles from './AuthPage.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [oauthProvider, setOauthProvider] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const {login, isLoading} = useAuth();
    const {showToast} = useToast();

    const handleLogin = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!email || !password) {
            setErrorMessage('Email and password are required');
            return;
        }

        try {
            const result = await login({email, password});
            showToast({message: 'Logged in successfully', type: 'success'});
            navigate(await getPostLoginRedirectPath(result.role, location.state?.from?.pathname), {replace: true});
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
            <div className={styles.authContainer}>
                <section className={styles.brandingSection}>
                    <div>
                        <div className={styles.logo}>WorkHub</div>
                        <h1 className={styles.tagline}>
                            Tìm việc IT phù hợp, kết nối với nhà tuyển dụng uy tín
                        </h1>
                        <p className={styles.valueProposition}>
                            Nền tảng tuyển dụng IT hàng đầu, kết nối ứng viên tài năng với các công ty công nghệ uy tín.
                        </p>
                    </div>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <FaCheckCircle className={styles.featureIcon}/>
                            <span className={styles.featureText}>
                                Hàng nghìn việc làm IT từ các công ty hàng đầu
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <FaBriefcase className={styles.featureIcon}/>
                            <span className={styles.featureText}>
                                Mức lương cạnh tranh và phúc lợi hấp dẫn
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <FaUsers className={styles.featureIcon}/>
                            <span className={styles.featureText}>
                                Kết nối trực tiếp với nhà tuyển dụng
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <FaRocket className={styles.featureIcon}/>
                            <span className={styles.featureText}>
                                Công cụ tìm kiếm thông minh và gợi ý việc làm phù hợp
                            </span>
                        </div>
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.header}>
                        <h1>Đăng nhập</h1>
                        <p>Chào mừng bạn quay trở lại với WorkHub</p>
                    </div>

                    {searchParams.get('error') && (
                        <ErrorMessage message={searchParams.get('error')}/>
                    )}

                    <form className={styles.form} onSubmit={handleLogin}>
                        <div className={styles.field}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>

                        {errorMessage && <ErrorMessage message={errorMessage}/>}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>

                    <div className={styles.divider}>hoặc</div>

                    <div className={styles.socialActions}>
                        <button
                            type="button"
                            className={styles.socialButton}
                            disabled={Boolean(oauthProvider)}
                            onClick={() => handleOAuthLogin('google')}
                        >
                            <FcGoogle className={styles.socialIcon}/>
                            {oauthProvider === 'google' ? 'Đang mở Google...' : 'Tiếp tục với Google'}
                        </button>
                        <button
                            type="button"
                            className={styles.socialButton}
                            disabled={Boolean(oauthProvider)}
                            onClick={() => handleOAuthLogin('facebook')}
                        >
                            <FaFacebook className={styles.socialIcon} style={{color: '#1877f2'}}/>
                            {oauthProvider === 'facebook' ? 'Đang mở Facebook...' : 'Tiếp tục với Facebook'}
                        </button>
                    </div>

                    <p className={styles.footer}>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </section>
            </div>
        </main>
    );
}
