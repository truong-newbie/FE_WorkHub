import {Link} from 'react-router-dom';
import styles from './UnauthorizedPage.module.css';

export default function UnauthorizedPage() {
    return (
        <div className={styles.page}>
            <h1>Unauthorized</h1>
            <p>You do not have permission to access this page.</p>
            <Link to="/">Back to home</Link>
        </div>
    );
}

