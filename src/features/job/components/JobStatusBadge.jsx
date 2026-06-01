import {getJobStatus} from '../jobUtils.js';
import styles from './Job.module.css';

export default function JobStatusBadge({job}) {
    const status = getJobStatus(job);
    return <span className={`${styles.statusBadge} ${styles[`status${status}`]}`}>{status}</span>;
}
