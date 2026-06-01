import {useCallback, useEffect, useState} from 'react';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import JobCard from '../components/JobCard.jsx';
import {getJobId} from '../jobUtils.js';
import {getSavedJobs, unsaveJob} from '../services/jobService.js';
import styles from '../components/Job.module.css';

export default function SavedJobsPage() {
    const {showToast} = useToast();
    const [favorites, setFavorites] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [busyId, setBusyId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const loadFavorites = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSavedJobs({page: page - 1, size: 10});
            const items = getItems(data);
            setFavorites(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load saved jobs.');
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => { loadFavorites(); }, [loadFavorites]);

    const removeFavorite = async (job) => {
        const id = getJobId(job);
        setBusyId(id);
        try {
            await unsaveJob(id);
            showToast({message: 'Job removed from saved jobs.', type: 'success'});
            await loadFavorites();
        } catch (error) {
            showToast({message: error.message || 'Unable to remove saved job.', type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Candidate workspace</p><h1>Saved jobs</h1><p>Keep interesting opportunities in one place and return when you are ready to apply.</p></div></header>
        <ErrorMessage message={errorMessage}/>
        <section className={styles.results}>{isLoading ? <LoadingState label="Loading saved jobs..."/> : favorites.length === 0 ? <div className={styles.empty}>You have not saved any jobs yet.</div> : favorites.map((favorite) => <JobCard key={favorite.id} job={favorite.job} saved onToggleFavorite={removeFavorite} favoriteBusy={busyId === getJobId(favorite.job)}/>)}</section>
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
    </div></main>;
}
