import {useAuth} from '../../stores/useAuth.js';
import styles from './RoleDashboard.module.css';

export default function RoleDashboard({title}) {
    const {role, user} = useAuth();

    return (
        <main className={styles.page}>
            <h1>{title}</h1>
            <p>{user?.email || user?.sub || 'Authenticated user'}</p>
            <span>{role || 'USER'}</span>
        </main>
    );
}

