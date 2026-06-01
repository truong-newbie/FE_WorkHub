import {getMatchLabel} from '../recommendationUtils.js';
import styles from './Recommendation.module.css';

export default function RecommendationExplanation({job}) {
    const score = Number(job.matchScore ?? job.hybridScore ?? 0);
    const matchedSkills = job.matchedSkills || [];
    const missingSkills = job.missingSkills || [];
    const reasons = job.reasons || [];

    return (
        <section className={styles.explanation}>
            <div className={styles.score}>
                <strong>{score.toFixed(1)}%</strong>
                <span>{getMatchLabel(score)}</span>
            </div>
            <div className={styles.reasonBody}>
                <p>{job.reasonText || reasons.map((reason) => reason.text).filter(Boolean).join(' ') || 'This role matches your current job preference.'}</p>
                {matchedSkills.length > 0 && <div className={styles.skillLine}><strong>Matched skills:</strong>{matchedSkills.map((skill) => <span className={styles.matched} key={skill}>{skill}</span>)}</div>}
                {missingSkills.length > 0 && <div className={styles.skillLine}><strong>Skills to consider:</strong>{missingSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
            </div>
        </section>
    );
}
