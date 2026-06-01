import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import RecommendationExplanation from '../../recommendation/components/RecommendationExplanation.jsx';
import {getCandidateOnboardingStatus, getRecommendedJobs, trackJobClick} from '../../recommendation/services/recommendationService.js';
import {getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import JobCard from '../components/JobCard.jsx';
import {getJobId} from '../jobUtils.js';
import {getSavedJobs, saveJob, unsaveJob} from '../services/jobService.js';
import styles from '../components/Job.module.css';

export default function RecommendedJobsPage() {
    const {showToast} = useToast();
    const [location, setLocation] = useState('');
    const [appliedLocation, setAppliedLocation] = useState('');
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [savedIds, setSavedIds] = useState(new Set());
    const [page, setPage] = useState(1);
    const [needsPreference, setNeedsPreference] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteBusyId, setFavoriteBusyId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const status = await getCandidateOnboardingStatus();
            if (!status.hasJobPreference || status.requiredPreference) {
                setNeedsPreference(true);
                setJobs([]);
                setMeta({total: 0, totalPages: 1});
                return;
            }
            setNeedsPreference(false);
            const [data, favoritesData] = await Promise.all([
                getRecommendedJobs({pageNum: page, pageSize: 10, location: appliedLocation || undefined, explain: true}),
                getSavedJobs({page: 0, size: 100}, {skipAuthCleanup: true}).catch(() => ({items: []})),
            ]);
            const items = getItems(data);
            setJobs(items);
            setMeta(getPaginationMeta(data, items.length));
            setSavedIds(new Set(getItems(favoritesData).map((favorite) => getJobId(favorite.job))));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load recommendations.');
        } finally {
            setIsLoading(false);
        }
    }, [appliedLocation, page]);

    useEffect(() => { loadJobs(); }, [loadJobs]);

    const toggleFavorite = async (job) => {
        const id = getJobId(job);
        setFavoriteBusyId(id);
        try {
            if (savedIds.has(id)) await unsaveJob(id); else await saveJob(id);
            showToast({message: savedIds.has(id) ? 'Job removed from saved jobs.' : 'Job saved.', type: 'success'});
            await loadJobs();
        } catch (error) {
            showToast({message: error.message || 'Unable to update saved job.', type: 'error'});
        } finally {
            setFavoriteBusyId('');
        }
    };

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Candidate recommendations</p><h1>Jobs selected for you</h1><p>Recommendations use your preferred role, skills, location and recent WorkHub activity.</p></div><Link className={styles.detailLink} to="/candidate/job-preference">Update job preference</Link></header>
        {!isLoading && !needsPreference && <section className={styles.panel}><form className={styles.searchRow} onSubmit={(event) => {event.preventDefault(); setPage(1); setAppliedLocation(location.trim());}}><Input label="Preferred location" name="recommendation-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Optional location filter"/><div/><Button type="submit">Apply filter</Button></form></section>}
        <ErrorMessage message={errorMessage}/>
        <section className={styles.results}>{isLoading ? <LoadingState label="Loading recommendations..."/> : needsPreference ? <div className={styles.empty}>Set up your job preference to receive personalized recommendations.<div className={styles.actions}><Link className={styles.detailLink} to="/candidate/job-preference">Set up job preference</Link></div></div> : jobs.length === 0 ? <div className={styles.empty}>No recommendations are available for the current preference. Update your preference or explore other jobs.<div className={styles.actions}><Link className={styles.detailLink} to="/candidate/job-preference">Update preference</Link><Link className={styles.detailLink} to="/jobs">Browse jobs</Link></div></div> : jobs.map((job, index) => <div key={getJobId(job)}><JobCard job={job} saved={savedIds.has(getJobId(job))} onToggleFavorite={toggleFavorite} favoriteBusy={favoriteBusyId === getJobId(job)} onJobClick={() => trackJobClick(getJobId(job), {source: 'RECOMMENDATION', position: (page - 1) * 10 + index + 1}).catch(() => {})}/><RecommendationExplanation job={job}/></div>)}</section>
        {!needsPreference && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>}
    </div></main>;
}
