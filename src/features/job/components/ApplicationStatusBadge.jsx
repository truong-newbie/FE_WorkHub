import styles from './Job.module.css';

export default function ApplicationStatusBadge({status = 'PENDING'}) {
    return <span className={`${styles.statusBadge} ${styles[`status${status}`] || styles.statusDRAFT}`}>{status}</span>;
}
