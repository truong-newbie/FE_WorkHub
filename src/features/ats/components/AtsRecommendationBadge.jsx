import {getRecommendationLabel, getRecommendationTone} from '../atsUtils.js';
import styles from './AtsScreening.module.css';

export default function AtsRecommendationBadge({recommendation}) {
    return (
        <span className={`${styles.recommendationBadge} ${styles[getRecommendationTone(recommendation)]}`}>
            {getRecommendationLabel(recommendation)}
        </span>
    );
}
