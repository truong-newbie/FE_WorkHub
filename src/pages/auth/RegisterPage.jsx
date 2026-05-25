import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ErrorMessage from '../../components/ui/ErrorMessage.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
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
        setIsSubmitting(true);

        try {
            await registerApi(form);
            showToast({message: 'Registered successfully. Please log in.', type: 'success'});
            navigate('/login', {replace: true});
        } catch (error) {
            const message = error.message || 'Registration failed';
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
                    <h1>Create WorkHub Account</h1>
                    <p>Register with the fields required by the WorkHub auth API.</p>
                </div>

                <form className={styles.form} onSubmit={handleRegister}>
                    <Input
                        className={styles.field}
                        label="Email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        required
                    />
                    <Input
                        className={styles.field}
                        label="Password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        required
                    />
                    <Input
                        className={styles.field}
                        label="Username"
                        name="username"
                        value={form.username}
                        onChange={(event) => updateField('username', event.target.value)}
                        required
                    />
                    <Input
                        className={styles.field}
                        label="Date of birth"
                        name="dob"
                        type="date"
                        value={form.dob}
                        onChange={(event) => updateField('dob', event.target.value)}
                        required
                    />
                    <Select
                        className={styles.field}
                        label="Gender"
                        name="gender"
                        value={form.gender}
                        onChange={(event) => updateField('gender', event.target.value)}
                    >
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                    </Select>
                    <ErrorMessage message={errorMessage}/>
                    <Button className={styles.fullWidth} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </Button>
                </form>

                <p className={styles.footer}>
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </section>
        </main>
    );
}

