import {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {FaKey, FaEnvelope} from 'react-icons/fa';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import {useToast} from '../../components/ui/useToast.js';
import {forgotPassword, verifyForgotPasswordOtp} from '../../services/authApi.js';
import styles from './AuthPage.module.css';
import {getForgotPasswordEmail, saveForgotPasswordEmail} from './forgotPasswordState.js';
import {isValidEmail, isValidOtp} from './validation.js';

export default function VerifyOtpPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {showToast} = useToast();

    const initialEmail = location.state?.email || getForgotPasswordEmail();
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerify = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!email || !isValidEmail(email)) {
            setErrorMessage('Email không hợp lệ');
            return;
        }

        if (!isValidOtp(otp)) {
            setErrorMessage('Mã OTP phải có 6 chữ số');
            return;
        }

        setIsSubmitting(true);

        try {
            await verifyForgotPasswordOtp({email, otp});
            saveForgotPasswordEmail(email);
            showToast({message: 'Xác thực OTP thành công', type: 'success'});
            navigate('/reset-password', {state: {email, otp}});
        } catch (error) {
            const message = error.message || 'Xác thực OTP thất bại';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setErrorMessage('');

        if (!email || !isValidEmail(email)) {
            setErrorMessage('Email không hợp lệ');
            return;
        }

        setIsResending(true);

        try {
            const result = await forgotPassword({email});
            saveForgotPasswordEmail(email);
            showToast({
                message: result?.message || 'Mã OTP mới đã được gửi đến email của bạn',
                type: 'success',
            });
            setOtp('');
        } catch (error) {
            const message = error.message || 'Gửi lại mã OTP thất bại';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsResending(false);
        }
    };

    return (
        <main className={styles.authPageSimple}>
            <section className={styles.panelSimple}>
                <div className={styles.stepIndicator}>
                    <div className={`${styles.step} ${styles.stepCompleted}`}>1</div>
                    <div className={styles.stepLine}></div>
                    <div className={`${styles.step} ${styles.stepActive}`}>2</div>
                    <div className={styles.stepLine}></div>
                    <div className={styles.step}>3</div>
                </div>

                <div className={styles.header}>
                    <h1>Xác thực OTP</h1>
                    <p>Nhập mã OTP 6 chữ số đã được gửi đến email của bạn</p>
                    {email && (
                        <p style={{fontSize: '14px', color: '#6c757d', marginTop: '8px'}}>
                            <FaEnvelope style={{marginRight: '6px'}}/>
                            {email}
                        </p>
                    )}
                </div>

                <form className={styles.form} onSubmit={handleVerify}>
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
                        <label htmlFor="otp">
                            <FaKey style={{display: 'inline', marginRight: '6px'}}/>
                            Mã OTP
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Nhập 6 chữ số"
                            value={otp}
                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            style={{fontSize: '20px', letterSpacing: '4px', textAlign: 'center'}}
                        />
                    </div>

                    {errorMessage && <ErrorMessage message={errorMessage}/>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xác thực...' : 'Xác thực OTP'}
                    </button>

                    <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={isResending}
                        onClick={handleResend}
                    >
                        {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Quay lại <Link to="/forgot-password">nhập email</Link>
                </p>
            </section>
        </main>
    );
}
