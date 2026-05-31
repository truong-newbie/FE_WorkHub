import {useCallback, useEffect, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {formatDate, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge.jsx';
import {getJobApplications, screenApplication, updateApplicationStatus} from '../services/jobService.js';
import styles from '../components/Job.module.css';

export default function JobApplicationsPage() {
    const {jobId} = useParams();
    const location = useLocation();
    const {showToast} = useToast();
    const [applications, setApplications] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const backPath = location.pathname.startsWith('/admin') ? '/admin/jobs' : '/recruiter/jobs';
    const resumeBasePath = location.pathname.startsWith('/admin') ? '/admin/jobs' : '/recruiter/jobs';

    const loadApplications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getJobApplications(jobId, {page: page - 1, size: 10});
            const items = getItems(data);
            setApplications(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load job applications.');
        } finally {
            setIsLoading(false);
        }
    }, [jobId, page]);

    useEffect(() => { loadApplications(); }, [loadApplications]);

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
            await screenApplication(application.id);
            showToast({message: 'ATS screening queued.', type: 'success'});
            await loadApplications();
        } catch (error) {
            showToast({message: error.message || 'Unable to queue ATS screening.', type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Hiring pipeline</p><h1>Job applications</h1><p>Review candidates, update recruitment status, and queue ATS screening.</p></div><Link className={styles.detailLink} to={backPath}>Back to jobs</Link></header>
        <ErrorMessage message={errorMessage}/>
        <section className={`${styles.panel} ${styles.applicationList}`}>{isLoading ? <LoadingState label="Loading job applications..."/> : applications.length === 0 ? <div className={styles.empty}>No candidates have applied for this job yet.</div> : applications.map((application) => <article className={styles.applicationCard} key={application.id}><div className={styles.applicationHeader}><div><h3>{application.candidate?.username || application.candidate?.email || 'Candidate'}</h3><p>{application.candidate?.headline || application.candidate?.email} | Applied {formatDate(application.appliedAt)}</p></div><ApplicationStatusBadge status={application.status}/></div><p className={styles.coverLetter}>{application.coverLetter}</p>{application.reviewNote && <p className={styles.muted}>Review note: {application.reviewNote}</p>}<div className={styles.actions}><Link className={styles.detailLink} to={`${resumeBasePath}/${jobId}/candidates/${application.candidate?.id}/resume`}>View resume</Link><Button variant="secondary" onClick={() => updateStatus(application, 'REVIEWING')} disabled={busyId === application.id}>Review</Button><Button variant="secondary" onClick={() => screen(application)} disabled={busyId === application.id}>ATS screen</Button><Button onClick={() => updateStatus(application, 'APPROVED')} disabled={busyId === application.id}>Approve</Button><Button variant="danger" onClick={() => updateStatus(application, 'REJECTED')} disabled={busyId === application.id}>Reject</Button></div></article>)}</section>
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
    </div></main>;
}
