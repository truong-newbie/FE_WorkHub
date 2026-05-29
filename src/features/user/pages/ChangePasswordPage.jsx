import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FaEye, FaEyeSlash, FaCheckCircle} from 'react-icons/fa';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {changeCurrentUserPassword} from '../services/userService.js';
import styles from './ChangePasswordPage.module.css';

const emptyPasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

function validatePasswordForm(form) {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        return 'Vui lòng điền đầy đủ tất cả các trường';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.newPassword)) {
        return 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
    }

    if (form.newPassword !== form.confirmPassword) {
        return 'Xác nhận mật khẩu không khớp';
    }

    return '';
}

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const {showToast} = useToast();

    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const updatePasswordField = (field, value) => {
        setPasswordForm((current) => ({...current, [field]: value}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const validationError = validatePasswordForm(passwordForm);

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            const message = await changeCurrentUserPassword(passwordForm);
            setPasswordForm(emptyPasswordForm);
            showToast({
                message: typeof message === 'string' ? message : 'Đổi mật khẩu thành công',
                type: 'success',
            });
            navigate('/profile');
        } catch (error) {
            const message = error.message || 'Đổi mật khẩu thất bại';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Đổi mật khẩu</h1>
                    <p>Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
                </div>

                <div className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formField}>
                            <label htmlFor="currentPassword" className={styles.label}>
                                Mật khẩu hiện tại
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    autoComplete="current-password"
                                    value={passwordForm.currentPassword}
                                    onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.toggleButton}
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <FaEyeSlash/> : <FaEye/>}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor="newPassword" className={styles.label}>
                                Mật khẩu mới
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    autoComplete="new-password"
                                    value={passwordForm.newPassword}
                                    onChange={(event) => updatePasswordField('newPassword', event.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.toggleButton}
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <FaEyeSlash/> : <FaEye/>}
                                </button>
                            </div>
                            <div className={styles.requirements}>
                                <div className={styles.requirementsTitle}>Yêu cầu mật khẩu:</div>
                                <ul className={styles.requirementsList}>
                                    <li className={styles.requirementItem}>
                                        <FaCheckCircle className={styles.requirementIcon}/>
                                        Ít nhất 8 ký tự
                                    </li>
                                    <li className={styles.requirementItem}>
                                        <FaCheckCircle className={styles.requirementIcon}/>
                                        Có ít nhất một chữ hoa (A-Z)
                                    </li>
                                    <li className={styles.requirementItem}>
                                        <FaCheckCircle className={styles.requirementIcon}/>
                                        Có ít nhất một chữ thường (a-z)
                                    </li>
                                    <li className={styles.requirementItem}>
                                        <FaCheckCircle className={styles.requirementIcon}/>
                                        Có ít nhất một chữ số (0-9)
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor="confirmPassword" className={styles.label}>
                                Xác nhận mật khẩu mới
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    autoComplete="new-password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.toggleButton}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash/> : <FaEye/>}
                                </button>
                            </div>
                        </div>

                        {errorMessage && <ErrorMessage message={errorMessage}/>}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
