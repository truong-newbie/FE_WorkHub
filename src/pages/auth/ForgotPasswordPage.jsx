import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import Input from '../../components/ui/Input.jsx';
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
            setErrorMessage('Email is required');
            return;
        }

        if (!isValidEmail(email)) {
            setErrorMessage('Enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await forgotPassword({email});
            saveForgotPasswordEmail(email);
            showToast({
                message: result?.message || 'OTP sent to your email',
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
            const message = error.message || 'Failed to send OTP';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.authPage}>
            <section className={styles.panel}>
                <div className={styles.header}>
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive a 6-digit OTP.</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
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
                    <ErrorMessage message={errorMessage}/>
                    <Button className={styles.fullWidth} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                </form>

                <p className={styles.footer}>
                    Remember your password? <Link to="/login">Log in</Link>
                </p>
            </section>
        </main>
    );
}

