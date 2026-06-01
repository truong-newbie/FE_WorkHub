import {getRequestStatusLabel} from '../recruiterRequestUtils.js';
import styles from './RequestStatusBadge.module.css';

export default function RequestStatusBadge({status}) {
    const normalizedStatus = status?.toLowerCase() || 'unknown';

    return (
        <span className={`${styles.badge} ${styles[normalizedStatus] || styles.unknown}`}>
            {getRequestStatusLabel(status)}
        </span>
    );
}
