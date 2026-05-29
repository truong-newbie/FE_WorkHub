import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {FaEnvelope} from 'react-icons/fa';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import {useToast} from '../../components/ui/useToast.js';
import {forgotPassword} from '../../services/authApi.js';
import styles from './AuthPage.module.css';
import {saveForgotPasswordEmail} from './forgotPasswordState.js';
import {isValidEmail} from './validation.js';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const {showToast} = useToast();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!email) {
            setErrorMessage('Vui lòng nhập email');
            return;
        }

        if (!isValidEmail(email)) {
            setErrorMessage('Email không hợp lệ');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await forgotPassword({email});
            saveForgotPasswordEmail(email);
            showToast({
                message: result?.message || 'Mã OTP đã được gửi đến email của bạn',
                type: 'success',
            });
            navigate('/verify-otp', {
                state: {
                    email,
                    maskedEmail: result?.email,
                    expiresInSeconds: result?.expiresInSeconds,
                },
            });
        } catch (error) {
            const message = error.message || 'Gửi mã OTP thất bại';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.authPageSimple}>
            <section className={styles.panelSimple}>
                <div className={styles.stepIndicator}>
                    <div className={`${styles.step} ${styles.stepActive}`}>1</div>
                    <div className={styles.stepLine}></div>
                    <div className={styles.step}>2</div>
                    <div className={styles.stepLine}></div>
                    <div className={styles.step}>3</div>
                </div>

                <div className={styles.header}>
                    <h1>Quên mật khẩu</h1>
                    <p>Nhập email của bạn để nhận mã xác thực OTP</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="email">
                            <FaEnvelope style={{display: 'inline', marginRight: '6px'}}/>
                            Email
                        </label>
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

                    {errorMessage && <ErrorMessage message={errorMessage}/>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang gửi mã OTP...' : 'Gửi mã OTP'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
                </p>
            </section>
        </main>
    );
}
