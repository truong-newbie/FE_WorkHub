import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import Table from '../../../components/ui/Table.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {cleanParams, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import JobStatusBadge from '../components/JobStatusBadge.jsx';
import {EMPLOYMENT_TYPES, getCompanyName, getJobId, JOB_LEVELS} from '../jobUtils.js';
import {deleteJob, getJobs, getJobStatistics, publishJob, reindexJobSearch, unpublishJob} from '../services/jobService.js';
import styles from '../components/Job.module.css';

const emptyFilters = {keyword: '', location: '', companyId: '', level: '', employmentType: '', published: 'true', includeExpired: 'true'};

export default function AdminJobManagementPage() {
    const {showToast} = useToast();
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
    const [jobs, setJobs] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            const [data, stats] = await Promise.all([
                getJobs(cleanParams({...appliedFilters, page: page - 1, size: 10, sortBy: 'createdDate', sortDir: 'DESC'})),
                getJobStatistics(),
            ]);
            const items = getItems(data);
            setJobs(items);
            setMeta(getPaginationMeta(data, items.length));
            setStatistics(stats);
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load jobs.');
        } finally {
            setIsLoading(false);
        }
    }, [appliedFilters, page]);

    useEffect(() => { loadJobs(); }, [loadJobs]);

    const updateFilter = (field, value) => setFilters((current) => ({...current, [field]: value}));

    const runAction = async (job, action) => {
        if (!window.confirm(`${action} "${job.title}"?`)) return;
        setBusyId(getJobId(job));
        try {
            if (action === 'publish') await publishJob(getJobId(job));
            if (action === 'unpublish') await unpublishJob(getJobId(job));
            if (action === 'soft-delete') await deleteJob(getJobId(job));
            showToast({message: `Job ${action} action completed.`, type: 'success'});
            await loadJobs();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} job.`, type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    const reindex = async () => {
        if (!window.confirm('Reindex all published jobs for search?')) return;
        setBusyId('reindex');
        try {
            const result = await reindexJobSearch();
            showToast({message: `Search reindex completed. ${result.indexedCount ?? 0} jobs indexed.`, type: 'success'});
        } catch (error) {
            showToast({message: error.message || 'Unable to reindex job search.', type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    const columns = [
        {key: 'job', header: 'Job', render: (job) => <div><strong>{job.title}</strong><p className={styles.muted}>{getCompanyName(job)} | {job.location}</p></div>},
        {key: 'level', header: 'Level', render: (job) => `${job.level || 'N/A'} | ${job.employmentType || 'N/A'}`},
        {key: 'status', header: 'Status', render: (job) => <JobStatusBadge job={job}/>},
        {key: 'actions', header: 'Actions', render: (job) => <div className={styles.actions}><Link className={styles.detailLink} to={`/jobs/${getJobId(job)}`}>View</Link><Link className={styles.detailLink} to={`/admin/jobs/${getJobId(job)}/applications`}>Applications</Link><Link className={styles.detailLink} to={`/admin/jobs/${getJobId(job)}/screenings`}>ATS ranking</Link><Link className={styles.detailLink} to={`/admin/jobs/${getJobId(job)}/assessments/create`}>Create assessment</Link><Button variant="secondary" onClick={() => runAction(job, job.published ? 'unpublish' : 'publish')} disabled={busyId === getJobId(job)}>{job.published ? 'Unpublish' : 'Publish'}</Button><Button variant="danger" onClick={() => runAction(job, 'soft-delete')} disabled={busyId === getJobId(job)}>Soft-delete</Button></div>},
    ];

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Job administration</p><h1>Job management</h1><p>Inspect platform postings, control publication state, and maintain the search index.</p></div><Button variant="secondary" onClick={reindex} disabled={busyId === 'reindex'}>{busyId === 'reindex' ? 'Reindexing...' : 'Reindex search'}</Button></header>
        <section className={styles.statsGrid}><div className={styles.stat}><span>Total jobs</span><strong>{statistics.totalJobs ?? 0}</strong></div><div className={styles.stat}><span>Published</span><strong>{statistics.publishedJobs ?? 0}</strong></div><div className={styles.stat}><span>Drafts</span><strong>{statistics.draftJobs ?? 0}</strong></div><div className={styles.stat}><span>Applications</span><strong>{statistics.totalApplications ?? 0}</strong></div><div className={styles.stat}><span>Pending applications</span><strong>{statistics.pendingApplications ?? 0}</strong></div></section>
        <section className={styles.panel}><form className={styles.formGrid} onSubmit={(event) => {event.preventDefault(); setPage(1); setAppliedFilters(filters);}}><Input label="Keyword" name="admin-job-keyword" value={filters.keyword} onChange={(event) => updateFilter('keyword', event.target.value)}/><Input label="Location" name="admin-job-location" value={filters.location} onChange={(event) => updateFilter('location', event.target.value)}/><Input label="Company ID" name="admin-job-company" type="number" value={filters.companyId} onChange={(event) => updateFilter('companyId', event.target.value)}/><Select label="Level" name="admin-job-level" value={filters.level} onChange={(event) => updateFilter('level', event.target.value)}><option value="">All</option>{JOB_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</Select><Select label="Employment type" name="admin-job-employment" value={filters.employmentType} onChange={(event) => updateFilter('employmentType', event.target.value)}><option value="">All</option>{EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</Select><Select label="Publication" name="admin-job-published" value={filters.published} onChange={(event) => updateFilter('published', event.target.value)}><option value="true">Published</option><option value="false">Draft</option></Select><div className={styles.formActions}><Button type="submit">Apply filters</Button><Button variant="secondary" onClick={() => {setFilters(emptyFilters); setAppliedFilters(emptyFilters); setPage(1);}}>Reset</Button></div></form></section>
        <section className={styles.panel}><ErrorMessage message={errorMessage}/>{isLoading ? <LoadingState label="Loading jobs..."/> : <><Table columns={columns} rows={jobs} getRowKey={getJobId} emptyMessage="No jobs match the current filters."/><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/></>}</section>
    </div></main>;
}
