import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {FaCheckCircle, FaBriefcase, FaUsers, FaRocket} from 'react-icons/fa';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import {registerApi} from '../../services/authApi.js';
import {useToast} from '../../components/ui/useToast.js';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        username: '',
        dob: '',
        gender: 'MALE',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const {showToast} = useToast();

    const updateField = (field, value) => {
        setForm((current) => ({...current, [field]: value}));
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!form.email || !form.password || !form.username || !form.dob) {
            setErrorMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (form.password.length < 6) {
            setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsSubmitting(true);

        try {
            await registerApi(form);
            showToast({message: 'Đăng ký thành công. Vui lòng đăng nhập.', type: 'success'});
            navigate('/login', {replace: true});
        } catch (error) {
            const message = error.message || 'Đăng ký thất bại';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.authPage}>
            <div className={styles.authContainer}>
                <section className={styles.brandingSection}>
                    <div>
                        <div className={styles.logo}>WorkHub</div>
                        <h1 className={styles.tagline}>
                            Bắt đầu hành trình sự nghiệp IT của bạn
                        </h1>
                        <p className={styles.valueProposition}>
                            Tạo tài khoản miễn phí để tiếp cận hàng nghìn cơ hội việc làm IT hấp dẫn từ các công ty hàng đầu.
                        </p>
                    </div>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <FaCheckCircle className={styles.featureIcon}/>
                            <span className={styles.featureText}>
                                Tạo hồ sơ chuyên nghiệp và nổi bật
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <FaBriefcase className={styles.featureIcon}/>
                            <span className={styles.featureText}>
                                Ứng tuyển nhanh chóng với một cú click
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <FaUsers className={styles.featureIcon}/>
                            <span className={styles.featureText}>
                                Nhận thông báo việc làm phù hợp với bạn
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <FaRocket className={styles.featureIcon}/>
                            <span className={styles.featureText}>
                                Theo dõi trạng thái ứng tuyển dễ dàng
                            </span>
                        </div>
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.header}>
                        <h1>Đăng ký tài khoản</h1>
                        <p>Tạo tài khoản WorkHub để bắt đầu tìm việc</p>
                    </div>

                    <form className={styles.form} onSubmit={handleRegister}>
                        <div className={styles.field}>
                            <label htmlFor="email">Email *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="your.email@example.com"
                                value={form.email}
                                onChange={(event) => updateField('email', event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password">Mật khẩu *</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Tối thiểu 6 ký tự"
                                value={form.password}
                                onChange={(event) => updateField('password', event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="username">Họ và tên *</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="name"
                                placeholder="Nguyễn Văn A"
                                value={form.username}
                                onChange={(event) => updateField('username', event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="dob">Ngày sinh *</label>
                            <input
                                id="dob"
                                name="dob"
                                type="date"
                                value={form.dob}
                                onChange={(event) => updateField('dob', event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="gender">Giới tính</label>
                            <select
                                id="gender"
                                name="gender"
                                value={form.gender}
                                onChange={(event) => updateField('gender', event.target.value)}
                            >
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>

                        {errorMessage && <ErrorMessage message={errorMessage}/>}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                        </button>
                    </form>

                    <p className={styles.footer}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                    </p>
                </section>
            </div>
        </main>
    );
}
