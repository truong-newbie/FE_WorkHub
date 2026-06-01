import {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {FaLock, FaCheckCircle} from 'react-icons/fa';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import {useToast} from '../../components/ui/useToast.js';
import {resetPassword} from '../../services/authApi.js';
import styles from './AuthPage.module.css';
import {clearForgotPasswordEmail, getForgotPasswordEmail} from './forgotPasswordState.js';
import {validatePasswordReset} from './validation.js';

export default function ResetPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {showToast} = useToast();

    const email = location.state?.email || getForgotPasswordEmail();
    const otp = location.state?.otp || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!email || !otp) {
            navigate('/verify-otp', {replace: true});
        }
    }, [email, navigate, otp]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const validationError = validatePasswordReset({newPassword, confirmPassword});

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await resetPassword({
                email,
                password: newPassword,
                repeatPassword: confirmPassword,
            });
            clearForgotPasswordEmail();
            showToast({
                message: typeof result === 'string' ? result : 'Đổi mật khẩu thành công',
                type: 'success',
            });
            navigate('/login', {replace: true});
        } catch (error) {
            const message = error.message || 'Đổi mật khẩu thất bại';
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
                    <div className={`${styles.step} ${styles.stepCompleted}`}>1</div>
                    <div className={styles.stepLine}></div>
                    <div className={`${styles.step} ${styles.stepCompleted}`}>2</div>
                    <div className={styles.stepLine}></div>
                    <div className={`${styles.step} ${styles.stepActive}`}>3</div>
                </div>

                <div className={styles.header}>
                    <h1>Đặt lại mật khẩu</h1>
                    <p>Tạo mật khẩu mới cho tài khoản WorkHub của bạn</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="newPassword">
                            <FaLock style={{display: 'inline', marginRight: '6px'}}/>
                            Mật khẩu mới
                        </label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Tối thiểu 6 ký tự"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirmPassword">
                            <FaCheckCircle style={{display: 'inline', marginRight: '6px'}}/>
                            Xác nhận mật khẩu
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />
                    </div>

                    {errorMessage && <ErrorMessage message={errorMessage}/>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Quay lại <Link to="/login">đăng nhập</Link>
                </p>
            </section>
        </main>
    );
}
