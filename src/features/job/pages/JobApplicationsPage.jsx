import {useCallback, useEffect, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import AtsScoreBadge from '../../ats/components/AtsScoreBadge.jsx';
import AtsRecommendationBadge from '../../ats/components/AtsRecommendationBadge.jsx';
import atsStyles from '../../ats/components/AtsScreening.module.css';
import {toScreeningMap} from '../../ats/atsUtils.js';
import {getApplicationScreeningResult, getJobScreeningResults, queueApplicationScreening} from '../../ats/services/atsScreeningService.js';
import {formatDate, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge.jsx';
import {getJobApplications, updateApplicationStatus} from '../services/jobService.js';
import styles from '../components/Job.module.css';

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 120000;

export default function JobApplicationsPage() {
    const {jobId} = useParams();
    const location = useLocation();
    const {showToast} = useToast();
    const [applications, setApplications] = useState([]);
    const [screeningResults, setScreeningResults] = useState({});
    const [processing, setProcessing] = useState({});
    const [screeningErrors, setScreeningErrors] = useState({});
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const basePath = location.pathname.startsWith('/admin') ? '/admin/jobs' : '/recruiter/jobs';

    const loadApplications = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const [applicationData, resultData] = await Promise.all([
                getJobApplications(jobId, {page: page - 1, size: 10}),
                getJobScreeningResults(jobId).catch(() => []),
            ]);
            const items = getItems(applicationData);
            setApplications(items);
            setMeta(getPaginationMeta(applicationData, items.length));
            setScreeningResults(toScreeningMap(resultData));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load job applications.');
        } finally {
            setIsLoading(false);
        }
    }, [jobId, page]);

    useEffect(() => { loadApplications(); }, [loadApplications]);

    useEffect(() => {
        const applicationIds = Object.keys(processing);
        if (applicationIds.length === 0) return undefined;

        const interval = window.setInterval(async () => {
            const now = Date.now();

            await Promise.all(applicationIds.map(async (applicationId) => {
                if (now - processing[applicationId] > POLL_TIMEOUT_MS) {
                    setProcessing((current) => {
                        const next = {...current};
                        delete next[applicationId];
                        return next;
                    });
                    setScreeningErrors((current) => ({...current, [applicationId]: 'Processing is taking longer than expected. Retry or refresh later.'}));
                    return;
                }

                try {
                    const result = await getApplicationScreeningResult(applicationId);
                    setScreeningResults((current) => ({...current, [String(applicationId)]: result}));
                    setProcessing((current) => {
                        const next = {...current};
                        delete next[applicationId];
                        return next;
                    });
                    setScreeningErrors((current) => {
                        const next = {...current};
                        delete next[applicationId];
                        return next;
                    });
                    showToast({message: 'ATS screening completed.', type: 'success'});
                    await loadApplications();
                } catch (error) {
                    if (error.status !== 404) {
                        setProcessing((current) => {
                            const next = {...current};
                            delete next[applicationId];
                            return next;
                        });
                        setScreeningErrors((current) => ({...current, [applicationId]: error.message || 'ATS screening failed. Retry when ready.'}));
                    }
                }
            }));
        }, POLL_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [loadApplications, processing, showToast]);

    const updateStatus = async (application, status) => {
        const reviewNote = window.prompt(`Review note for ${status}:`, application.reviewNote || '');
        if (reviewNote === null) return;
        setBusyId(application.id);
        try {
            await updateApplicationStatus(application.id, {status, reviewNote});
            showToast({message: `Application moved to ${status}.`, type: 'success'});
            await loadApplications();
        } catch (error) {
            showToast({message: error.message || 'Unable to update application.', type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    const screen = async (application) => {
        if (!window.confirm(`Queue ATS screening for "${application.candidate?.username || application.candidate?.email}"?`)) return;
        setBusyId(application.id);
        try {
            await queueApplicationScreening(application.id);
            setProcessing((current) => ({...current, [application.id]: Date.now()}));
            setScreeningErrors((current) => {
                const next = {...current};
                delete next[application.id];
                return next;
            });
            showToast({message: 'ATS screening queued. The report will refresh when analysis completes.', type: 'success'});
        } catch (error) {
            setScreeningErrors((current) => ({...current, [application.id]: error.message || 'Unable to queue ATS screening.'}));
            showToast({message: error.message || 'Unable to queue ATS screening.', type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <div><p className={styles.eyebrow}>Hiring pipeline</p><h1>Job applications</h1><p>Review candidates, queue ATS resume screening, and update recruitment status.</p></div>
                    <div className={styles.actions}><Link className={styles.detailLink} to={`${basePath}/${jobId}/screenings`}>ATS ranking</Link><Link className={styles.detailLink} to={`${basePath}/${jobId}/assessments/create`}>Create assessment</Link><Link className={styles.detailLink} to={basePath}>Back to jobs</Link></div>
                </header>
                <ErrorMessage message={errorMessage}/>
                <section className={`${styles.panel} ${styles.applicationList}`}>
                    {isLoading ? <LoadingState label="Loading job applications..."/> : applications.length === 0 ? <div className={styles.empty}>No candidates have applied for this job yet.</div> : applications.map((application) => {
                        const screeningResult = screeningResults[String(application.id)];
                        const isProcessing = Boolean(processing[application.id]);
                        const screeningError = screeningErrors[application.id];

                        return (
                            <article className={styles.applicationCard} key={application.id}>
                                <div className={styles.applicationHeader}><div><h3>{application.candidate?.username || application.candidate?.email || 'Candidate'}</h3><p>{application.candidate?.headline || application.candidate?.email} | Applied {formatDate(application.appliedAt)}</p></div><ApplicationStatusBadge status={application.status}/></div>
                                <p className={styles.coverLetter}>{application.coverLetter}</p>
                                {application.reviewNote && <p className={styles.muted}>Review note: {application.reviewNote}</p>}
                                <div className={styles.actions}>
                                    <Link className={styles.detailLink} to={`${basePath}/${jobId}/candidates/${application.candidate?.id}/resume`}>View resume</Link>
                                    {screeningResult && <><AtsScoreBadge score={screeningResult.totalScore}/><AtsRecommendationBadge recommendation={screeningResult.recommendation}/><Link className={styles.detailLink} to={`${basePath}/applications/${application.id}/screening-result`}>View ATS result</Link><Button variant="secondary" onClick={() => screen(application)} disabled={busyId === application.id}>Re-screen</Button></>}
                                    {!screeningResult && isProcessing && <span className={atsStyles.processingBadge}>Analyzing resume...</span>}
                                    {!screeningResult && !isProcessing && <Button variant="secondary" onClick={() => screen(application)} disabled={busyId === application.id}>{screeningError ? 'Retry ATS screening' : 'Screen resume'}</Button>}
                                    <Button variant="secondary" onClick={() => updateStatus(application, 'REVIEWING')} disabled={busyId === application.id}>Review</Button>
                                    <Button onClick={() => updateStatus(application, 'APPROVED')} disabled={busyId === application.id}>Approve</Button>
                                    <Button variant="danger" onClick={() => updateStatus(application, 'REJECTED')} disabled={busyId === application.id}>Reject</Button>
                                </div>
                                {screeningError && <p className={atsStyles.failedBadge}>{screeningError}</p>}
                            </article>
                        );
                    })}
                </section>
                <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
            </div>
        </main>
    );
}
