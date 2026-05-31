import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {formatDate, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge.jsx';
import {getJobId} from '../jobUtils.js';
import {getMyApplications, withdrawJobApplication} from '../services/jobService.js';
import styles from '../components/Job.module.css';

export default function CandidateApplicationsPage() {
    const {showToast} = useToast();
    const [applications, setApplications] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadApplications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMyApplications({page: page - 1, size: 10});
            const items = getItems(data);
            setApplications(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load applications.');
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => { loadApplications(); }, [loadApplications]);

    const withdraw = async (application) => {
        if (!window.confirm(`Withdraw application for "${application.job?.title}"?`)) return;
        setIsSaving(true);
        try {
            await withdrawJobApplication(getJobId(application.job));
            showToast({message: 'Application withdrawn.', type: 'success'});
            await loadApplications();
        } catch (error) {
            showToast({message: error.message || 'Unable to withdraw application.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Candidate workspace</p><h1>My applications</h1><p>Track your submitted applications and withdraw requests that are still pending.</p></div></header>
        <ErrorMessage message={errorMessage}/>
        <section className={`${styles.panel} ${styles.applicationList}`}>{isLoading ? <LoadingState label="Loading applications..."/> : applications.length === 0 ? <div className={styles.empty}>You have not applied for any jobs yet.</div> : applications.map((application) => <article className={styles.applicationCard} key={application.id}><div className={styles.applicationHeader}><div><h3>{application.job?.title || 'Job application'}</h3><p>{application.job?.companyName || application.job?.location || 'Company information pending'} | Applied {formatDate(application.appliedAt)}</p></div><ApplicationStatusBadge status={application.status}/></div><p className={styles.coverLetter}>{application.coverLetter}</p><div className={styles.actions}><Link className={styles.detailLink} to={`/jobs/${getJobId(application.job)}`}>View job</Link>{application.status === 'PENDING' && <Button variant="secondary" onClick={() => withdraw(application)} disabled={isSaving}>Withdraw</Button>}</div></article>)}</section>
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
    </div></main>;
}
