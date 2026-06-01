import {formatScore, getScoreLabel, getScoreTone} from '../atsUtils.js';
import styles from './AtsScreening.module.css';

export default function AtsScoreBadge({score, showLabel = true}) {
    const tone = getScoreTone(score);

    return (
        <span className={`${styles.scoreBadge} ${styles[tone]}`}>
            {formatScore(score)}
            {showLabel && <small>{getScoreLabel(score)}</small>}
        </span>
    );
}
