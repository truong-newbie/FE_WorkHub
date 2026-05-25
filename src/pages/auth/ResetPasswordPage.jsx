import {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import Input from '../../components/ui/Input.jsx';
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
                message: typeof result === 'string' ? result : 'Password changed successfully',
                type: 'success',
            });
            navigate('/login', {replace: true});
        } catch (error) {
            const message = error.message || 'Failed to reset password';
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
                    <h1>Reset Password</h1>
                    <p>Create a new password for your WorkHub account.</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <Input
                        className={styles.field}
                        label="New password"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        required
                    />
                    <Input
                        className={styles.field}
                        label="Confirm password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                    />
                    <ErrorMessage message={errorMessage}/>
                    <Button className={styles.fullWidth} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Resetting...' : 'Reset password'}
                    </Button>
                </form>

                <p className={styles.footer}>
                    Back to <Link to="/login">login</Link>
                </p>
            </section>
        </main>
    );
}
