import {getExplanationLabel, getExplanationTone} from '../atsUtils.js';
import styles from './AtsScreening.module.css';

export default function AtsExplanationBadge({status}) {
    return (
        <span className={`${styles.explanationBadge} ${styles[getExplanationTone(status)]}`}>
            {getExplanationLabel(status)}
        </span>
    );
}
