import styles from '../Assessment.module.css';
import { statusTone } from '../assessmentUtils';

export default function AssessmentStatusBadge({ status }) {
  return <span className={`${styles.badge} ${styles[statusTone(status)]}`}>{status || 'UNKNOWN'}</span>;
}
