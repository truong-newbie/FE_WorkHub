import {useState} from "react";
import styles from './login.module.css'
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../../../stores/useAuth.js';
import {useToast} from '../../ui/useToast.js';
import ErrorMessage from '../../ui/ErrorMessage.jsx';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const {login, isLoading} = useAuth();
    const {showToast} = useToast();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            await login({username, password});
            showToast({message: 'Logged in successfully', type: 'success'});
            navigate(location.state?.from?.pathname || '/');
        } catch (error) {
            const message = error.message || 'Login failed';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        }
    };

    return (
        <div className={styles.login_body}>
            <form onSubmit={handleSignIn}>
                <div className={styles.content}>
                    <img src="/login/logo_ins.png" alt="" className={styles.logo}/>
                    <div>
                        <input type="text" placeholder="Phone numbber, username, or email"
                               className={styles.username}
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <input type="password" placeholder="Password" className={styles.password}
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <ErrorMessage message={errorMessage}/>
                    <div>
                        <button type="submit" className={styles.btn_login} disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </button>
                    </div>
                    <p className={styles.or}>---------------------- OR ----------------------</p>
                    <div className={styles.outh2F}>
                        <img src="/login/fb.png" alt=""/>
                        <div>
                            <a href="#">Log in with Facebook</a>
                        </div>
                    </div>
                    <p className={styles.forgot_password}><a href="#">Forgot password?</a></p>
                </div>

                <div className={styles.signup}>
                    <p>Don't have an account? </p>
                    <div>
                        <a href="/register">Sign up</a>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Login;
