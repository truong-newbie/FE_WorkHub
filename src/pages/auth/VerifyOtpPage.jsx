import {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import Input from '../../components/ui/Input.jsx';
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
            setErrorMessage('A valid email is required');
            return;
        }

        if (!isValidOtp(otp)) {
            setErrorMessage('OTP must be 6 digits');
            return;
        }

        setIsSubmitting(true);

        try {
            await verifyForgotPasswordOtp({email, otp});
            saveForgotPasswordEmail(email);
            showToast({message: 'OTP verified successfully', type: 'success'});
            navigate('/reset-password', {state: {email, otp}});
        } catch (error) {
            const message = error.message || 'OTP verification failed';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setErrorMessage('');

        if (!email || !isValidEmail(email)) {
            setErrorMessage('A valid email is required before resending OTP');
            return;
        }

        setIsResending(true);

        try {
            const result = await forgotPassword({email});
            saveForgotPasswordEmail(email);
            showToast({
                message: result?.message || 'OTP resent to your email',
                type: 'success',
            });
        } catch (error) {
            const message = error.message || 'Failed to resend OTP';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsResending(false);
        }
    };

    return (
        <main className={styles.authPage}>
            <section className={styles.panel}>
                <div className={styles.header}>
                    <h1>Verify OTP</h1>
                    <p>Enter the 6-digit code sent to your email.</p>
                </div>

                <form className={styles.form} onSubmit={handleVerify}>
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
                        label="OTP"
                        name="otp"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                    />
                    <ErrorMessage message={errorMessage}/>
                    <Button className={styles.fullWidth} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <Button
                        className={styles.fullWidth}
                        type="button"
                        variant="secondary"
                        disabled={isResending}
                        onClick={handleResend}
                    >
                        {isResending ? 'Resending...' : 'Resend OTP'}
                    </Button>
                </form>

                <p className={styles.footer}>
                    Back to <Link to="/forgot-password">forgot password</Link>
                </p>
            </section>
        </main>
    );
}

