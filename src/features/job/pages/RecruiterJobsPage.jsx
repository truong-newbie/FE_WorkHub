import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getCurrentCompany, getCompanyJobs} from '../../company/services/companyService.js';
import {getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import JobCard from '../components/JobCard.jsx';
import {getJobId} from '../jobUtils.js';
import {deleteJob, publishJob, unpublishJob} from '../services/jobService.js';
import styles from '../components/Job.module.css';

export default function RecruiterJobsPage() {
    const {showToast} = useToast();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [busyId, setBusyId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const currentCompany = await getCurrentCompany();
            setCompany(currentCompany);
            const data = await getCompanyJobs(currentCompany.id, {pageNum: page, pageSize: 10, sortBy: 'createdDate', isAscending: false});
            const items = getItems(data);
            setJobs(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setCompany(null);
            setErrorMessage(error.status === 404 ? 'Connect your recruiter account to a company before creating job openings.' : error.message || 'Unable to load company jobs.');
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => { loadJobs(); }, [loadJobs]);

    const runAction = async (job, action) => {
        const message = action === 'delete' ? 'Soft-delete' : action === 'publish' ? 'Publish' : 'Unpublish';
        if (!window.confirm(`${message} "${job.title}"?`)) return;
        setBusyId(getJobId(job));
        try {
            if (action === 'delete') await deleteJob(getJobId(job));
            if (action === 'publish') await publishJob(getJobId(job));
            if (action === 'unpublish') await unpublishJob(getJobId(job));
            showToast({message: `Job ${action} action completed.`, type: 'success'});
            await loadJobs();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} job.`, type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Recruiter workspace</p><h1>Job postings</h1><p>{company ? `Manage openings for ${company.name}.` : 'Connect to a company to manage hiring opportunities.'}</p></div>{company && <Link className={styles.detailLink} to="/recruiter/jobs/create">Create job</Link>}</header>
        <ErrorMessage message={errorMessage}/>
        {isLoading ? <LoadingState label="Loading company jobs..."/> : !company ? <div className={styles.notice}><Link className={styles.companyLink} to="/recruiter/company">Open company onboarding</Link></div> : jobs.length === 0 ? <div className={styles.empty}>No job postings yet. Create a draft when your company is ready to hire.</div> : <section className={styles.results}>{jobs.map((job) => <div key={getJobId(job)}><JobCard job={job} showStatus/><div className={styles.toolbar}><Link className={styles.detailLink} to={`/recruiter/jobs/${getJobId(job)}/edit`}>Edit</Link><Link className={styles.detailLink} to={`/recruiter/jobs/${getJobId(job)}/applications`}>Applications</Link><Link className={styles.detailLink} to={`/recruiter/jobs/${getJobId(job)}/screenings`}>ATS ranking</Link><Button variant="secondary" onClick={() => runAction(job, job.published ? 'unpublish' : 'publish')} disabled={busyId === getJobId(job)}>{job.published ? 'Unpublish' : 'Publish'}</Button><Button variant="danger" onClick={() => runAction(job, 'delete')} disabled={busyId === getJobId(job)}>Soft-delete</Button></div></div>)}</section>}
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
    </div></main>;
}
