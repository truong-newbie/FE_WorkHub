import {useCallback, useEffect, useState} from 'react';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import JobCard from '../components/JobCard.jsx';
import {getJobId} from '../jobUtils.js';
import {getRecommendedJobs} from '../services/jobService.js';
import styles from '../components/Job.module.css';

export default function RecommendedJobsPage() {
    const [location, setLocation] = useState('');
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getRecommendedJobs({page: page - 1, size: 10, location: location || undefined, explain: true});
            const items = getItems(data);
            setJobs(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load recommendations. Create your job preference first if you have not configured one yet.');
        } finally {
            setIsLoading(false);
        }
    }, [location, page]);

    useEffect(() => { loadJobs(); }, [loadJobs]);

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Candidate recommendations</p><h1>Jobs selected for you</h1><p>Recommendations use your job preference and activity signals from WorkHub.</p></div></header>
        <section className={styles.panel}><Input label="Preferred location" name="recommendation-location" value={location} onChange={(event) => {setPage(1); setLocation(event.target.value);}} placeholder="Optional location filter"/></section>
        <ErrorMessage message={errorMessage}/>
        <section className={styles.results}>{isLoading ? <LoadingState label="Loading recommendations..."/> : jobs.length === 0 ? <div className={styles.empty}>No recommendations are available for the current preference.</div> : jobs.map((job) => <div key={getJobId(job)}><JobCard job={job}/>{job.reasonText && <p className={styles.muted}>{job.reasonText}</p>}</div>)}</section>
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
    </div></main>;
}
