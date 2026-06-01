import {useEffect, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import AtsScreeningReport from '../components/AtsScreeningReport.jsx';
import {getApplicationScreeningResult} from '../services/atsScreeningService.js';
import styles from '../components/AtsScreening.module.css';

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 120000;

export default function AtsScreeningDetailPage() {
    const {applicationId} = useParams();
    const location = useLocation();
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const basePath = location.pathname.startsWith('/admin') ? '/admin/jobs' : '/recruiter/jobs';

    useEffect(() => {
        let isActive = true;
        let timeoutId;
        const startedAt = Date.now();

        const loadResult = async () => {
            try {
                const data = await getApplicationScreeningResult(applicationId);
                if (!isActive) return;
                setResult(data);
                setIsProcessing(false);
                setErrorMessage('');
            } catch (error) {
                if (!isActive) return;
                if (error.status === 404 && Date.now() - startedAt < POLL_TIMEOUT_MS) {
                    setIsProcessing(true);
                    setErrorMessage('');
                    timeoutId = window.setTimeout(loadResult, POLL_INTERVAL_MS);
                    return;
                }
                setIsProcessing(false);
                setErrorMessage(error.status === 404 ? 'ATS processing is taking longer than expected. Refresh later or re-screen the resume.' : error.message || 'Unable to load ATS screening result.');
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        setIsLoading(true);
        setIsProcessing(false);
        setResult(null);
        setErrorMessage('');
        loadResult();

        return () => {
            isActive = false;
            window.clearTimeout(timeoutId);
        };
    }, [applicationId]);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <div><p className={styles.eyebrow}>Hiring intelligence</p><h1>ATS screening report</h1><p>Review the resume match before moving the candidate through the hiring pipeline.</p></div>
                    {result?.jobId && <Link className={styles.detailLink} to={`${basePath}/${result.jobId}/screenings`}>Back to ranking</Link>}
                </header>
                <ErrorMessage message={errorMessage}/>
                {isLoading ? <LoadingState label="Loading ATS screening report..."/> : result ? <AtsScreeningReport result={result}/> : isProcessing ? <div className={styles.empty}><span className={styles.processingBadge}>Analyzing resume...</span><p className={styles.muted}>The report will refresh automatically when ATS processing completes.</p></div> : <div className={styles.empty}>No completed ATS report is available for this application.</div>}
            </div>
        </main>
    );
}
