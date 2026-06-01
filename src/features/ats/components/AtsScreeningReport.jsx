import {FaBriefcase, FaCheckCircle, FaClock, FaExclamationCircle, FaUser} from 'react-icons/fa';
import {formatDate} from '../../shared/moduleUtils.js';
import {formatConfidence, formatScore, getScoreLabel, getScreeningSummary} from '../atsUtils.js';
import AtsExplanationBadge from './AtsExplanationBadge.jsx';
import AtsRecommendationBadge from './AtsRecommendationBadge.jsx';
import styles from './AtsScreening.module.css';

function SkillList({items = [], emptyMessage, tone}) {
    return items.length > 0
        ? <div className={styles.skillTags}>{items.map((item) => <span className={styles[tone]} key={item}>{item}</span>)}</div>
        : <p className={styles.muted}>{emptyMessage}</p>;
}

export default function AtsScreeningReport({result}) {
    const breakdown = [
        ['Keyword skill match', result.skillScore],
        ['Semantic relevance', result.semanticScore],
    ];
    const summary = getScreeningSummary(result);

    return (
        <div className={styles.report}>
            <section className={styles.scoreHero}>
                <div>
                    <p className={styles.eyebrow}>ATS resume screening</p>
                    <h1>{result.candidateName || 'Candidate screening result'}</h1>
                    <div className={styles.heroMeta}>
                        <span><FaUser/>{result.candidateId || 'Candidate ID unavailable'}</span>
                        <span><FaBriefcase/>{result.jobTitle || `Job #${result.jobId}`}</span>
                        <span><FaClock/>Screened {formatDate(result.screenedAt)}</span>
                    </div>
                </div>
                <div className={styles.overallScore}>
                    <span>Overall match</span>
                    <strong>{formatScore(result.totalScore)}</strong>
                    <small>{getScoreLabel(result.totalScore)}</small>
                    <AtsRecommendationBadge recommendation={result.recommendation}/>
                </div>
            </section>

            <section className={styles.breakdownGrid}>
                {breakdown.map(([label, score]) => (
                    <article className={styles.breakdownCard} key={label}>
                        <span>{label}</span>
                        <strong>{formatScore(score)}</strong>
                        {score === null || score === undefined ? <small>Not scored by worker</small> : <small>ATS score component</small>}
                    </article>
                ))}
            </section>

            <div className={styles.reportGrid}>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}><FaCheckCircle/><h2>Matched skills</h2><span>{result.matchedSkills?.length || 0}</span></div>
                    <SkillList items={result.matchedSkills} emptyMessage="No matched skills were returned." tone="matched"/>
                </section>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}><FaExclamationCircle/><h2>Missing skills</h2><span>{result.missingSkills?.length || 0}</span></div>
                    <SkillList items={result.missingSkills} emptyMessage="No missing skills were returned." tone="missing"/>
                </section>
            </div>

            <section className={styles.panel}>
                <div className={styles.panelHeader}><h2>Additional candidate skills</h2><span>{result.extraSkills?.length || 0}</span></div>
                <SkillList items={result.extraSkills} emptyMessage="No additional skills were returned." tone="extra"/>
            </section>

            <div className={styles.reportGrid}>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}><FaCheckCircle/><h2>Strengths</h2><span>{result.strengths?.length || 0}</span></div>
                    <InsightList items={result.strengths} emptyMessage="No strengths were returned for this report."/>
                </section>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}><FaExclamationCircle/><h2>Weaknesses</h2><span>{result.weaknesses?.length || 0}</span></div>
                    <InsightList items={result.weaknesses} emptyMessage="No weaknesses were returned for this report."/>
                </section>
            </div>

            <section className={styles.panel}>
                <div className={styles.panelHeader}><h2>Recruiter summary</h2><AtsExplanationBadge status={result.explanationStatus}/></div>
                <p className={styles.summary}>{summary || 'No written explanation is available for this screening result yet.'}</p>
                <div className={styles.explanationMeta}><AtsRecommendationBadge recommendation={result.recommendation}/><span>Confidence: <strong>{formatConfidence(result.confidence)}</strong></span></div>
            </section>
        </div>
    );
}

function InsightList({items = [], emptyMessage}) {
    return items.length > 0
        ? <ul className={styles.insightList}>{items.map((item) => <li key={item}>{item}</li>)}</ul>
        : <p className={styles.muted}>{emptyMessage}</p>;
}
