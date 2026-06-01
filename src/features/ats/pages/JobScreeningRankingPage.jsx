import {useCallback, useEffect, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import {formatDate} from '../../shared/moduleUtils.js';
import {formatConfidence, getScreeningSummary} from '../atsUtils.js';
import AtsRecommendationBadge from '../components/AtsRecommendationBadge.jsx';
import AtsScoreBadge from '../components/AtsScoreBadge.jsx';
import {getJobScreeningResults} from '../services/atsScreeningService.js';
import styles from '../components/AtsScreening.module.css';

export default function JobScreeningRankingPage() {
    const {jobId} = useParams();
    const location = useLocation();
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const basePath = location.pathname.startsWith('/admin') ? '/admin/jobs' : '/recruiter/jobs';

    const loadResults = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            setResults(await getJobScreeningResults(jobId));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load ATS candidate ranking.');
        } finally {
            setIsLoading(false);
        }
    }, [jobId]);

    useEffect(() => { loadResults(); }, [loadResults]);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <div><p className={styles.eyebrow}>ATS candidate ranking</p><h1>{results[0]?.jobTitle || `Job #${jobId}`}</h1><p>{results.length} screened candidates ordered by overall ATS score.</p></div>
                    <div className={styles.actions}><Link className={styles.detailLink} to={`${basePath}/${jobId}/applications`}>Back to applications</Link></div>
                </header>
                <ErrorMessage message={errorMessage}/>
                {isLoading ? <LoadingState label="Loading ATS candidate ranking..."/> : results.length === 0 ? <div className={styles.empty}>No ATS screening results are available for this job yet.</div> : (
                    <section className={styles.rankingPanel}>
                        <table className={styles.rankingTable}>
                            <thead><tr><th>Rank</th><th>Candidate</th><th>Recommendation</th><th>ATS score</th><th>Confidence</th><th>Summary</th><th>Screened at</th><th>Action</th></tr></thead>
                            <tbody>{results.map((result, index) => <tr key={result.id || result.applicationId}><td>#{index + 1}</td><td><strong>{result.candidateName || result.candidateId}</strong></td><td><AtsRecommendationBadge recommendation={result.recommendation}/></td><td><AtsScoreBadge score={result.totalScore}/></td><td>{formatConfidence(result.confidence)}</td><td><p className={styles.summaryPreview}>{getScreeningSummary(result) || 'No summary available.'}</p></td><td>{formatDate(result.screenedAt)}</td><td><Link className={styles.detailLink} to={`${basePath}/applications/${result.applicationId}/screening-result`}>View report</Link></td></tr>)}</tbody>
                        </table>
                    </section>
                )}
            </div>
        </main>
    );
}
