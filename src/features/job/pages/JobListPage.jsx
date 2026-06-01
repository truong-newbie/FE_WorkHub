import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {useAuth} from '../../../stores/useAuth.js';
import SkillSelector from '../../skill/components/SkillSelector.jsx';
import {trackJobSearch} from '../../recommendation/services/recommendationService.js';
import {cleanParams, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import JobCard from '../components/JobCard.jsx';
import {EMPLOYMENT_TYPES, getJobId, JOB_LEVELS} from '../jobUtils.js';
import {getJobAutocomplete, getLatestJobs, getSavedJobs, saveJob, searchJobs, unsaveJob} from '../services/jobService.js';
import styles from '../components/Job.module.css';

const emptyFilters = {keyword: '', location: '', salaryMin: '', salaryMax: '', level: '', employmentType: '', skillIds: [], sortBy: 'createdDate', isAscending: false};

export default function JobListPage() {
    const navigate = useNavigate();
    const {showToast} = useToast();
    const {isAuthenticated, roles} = useAuth();
    const isCandidate = roles.includes('CANDIDATE');
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [savedIds, setSavedIds] = useState(new Set());
    const [suggestions, setSuggestions] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteBusyId, setFavoriteBusyId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const data = isAuthenticated
                ? await searchJobs(cleanParams({
                    keyword: appliedFilters.keyword,
                    location: appliedFilters.location,
                    salaryMin: appliedFilters.salaryMin,
                    salaryMax: appliedFilters.salaryMax,
                    level: appliedFilters.level,
                    employmentType: appliedFilters.employmentType,
                    skillIds: appliedFilters.skillIds.join(',') || undefined,
                    pageNum: page,
                    pageSize: 10,
                    sortBy: appliedFilters.sortBy,
                    isAscending: appliedFilters.isAscending,
                }))
                : await getLatestJobs({page: page - 1, size: 10, sortBy: 'createdDate', sortDir: 'DESC'});
            const items = getItems(data);
            setJobs(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load jobs.');
        } finally {
            setIsLoading(false);
        }
    }, [appliedFilters, isAuthenticated, page]);

    const loadSavedIds = useCallback(async () => {
        if (!isCandidate) return;
        try {
            const data = await getSavedJobs({page: 0, size: 100});
            setSavedIds(new Set(getItems(data).map((favorite) => getJobId(favorite.job))));
        } catch {
            setSavedIds(new Set());
        }
    }, [isCandidate]);

    useEffect(() => { loadJobs(); }, [loadJobs]);
    useEffect(() => { loadSavedIds(); }, [loadSavedIds]);

    useEffect(() => {
        if (!isAuthenticated || filters.keyword.trim().length < 2) {
            setSuggestions([]);
            return undefined;
        }
        const timeout = window.setTimeout(async () => {
            try {
                setSuggestions(await getJobAutocomplete({keyword: filters.keyword.trim(), limit: 6}));
            } catch {
                setSuggestions([]);
            }
        }, 350);
        return () => window.clearTimeout(timeout);
    }, [filters.keyword, isAuthenticated]);

    const updateFilter = (field, value) => setFilters((current) => ({...current, [field]: value}));

    const submitSearch = (event) => {
        event.preventDefault();
        if (!isAuthenticated && (filters.keyword || filters.location)) {
            navigate('/login', {state: {from: {pathname: '/jobs'}}});
            return;
        }
        setPage(1);
        setAppliedFilters(filters);
        if (isCandidate && filters.keyword.trim()) {
            trackJobSearch({
                keyword: filters.keyword.trim(),
                filtersJson: JSON.stringify({
                    ...(filters.location ? {location: filters.location} : {}),
                    ...(filters.level ? {level: filters.level} : {}),
                    ...(filters.employmentType ? {employmentType: filters.employmentType} : {}),
                    ...(filters.skillIds.length ? {skillIds: filters.skillIds} : {}),
                }),
            }).catch(() => {});
        }
    };

    const resetFilters = () => {
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setPage(1);
    };

    const toggleFavorite = async (job) => {
        const id = getJobId(job);
        setFavoriteBusyId(id);
        try {
            if (savedIds.has(id)) await unsaveJob(id); else await saveJob(id);
            await loadSavedIds();
            showToast({message: savedIds.has(id) ? 'Job removed from saved jobs.' : 'Job saved.', type: 'success'});
        } catch (error) {
            showToast({message: error.message || 'Unable to update saved job.', type: 'error'});
        } finally {
            setFavoriteBusyId('');
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.pageHeader}><div><p className={styles.eyebrow}>WorkHub Jobs</p><h1>Find your next opportunity</h1><p>Explore active positions from verified employers and narrow the list with practical filters.</p></div></header>
                <section className={`${styles.panel} ${styles.searchBox}`}>
                    <form className={styles.searchRow} onSubmit={submitSearch}>
                        <Input label="Keyword" name="job-keyword" value={filters.keyword} onChange={(event) => updateFilter('keyword', event.target.value)} placeholder="Job title, skill, or company"/>
                        <Input label="Location" name="job-location-search" value={filters.location} onChange={(event) => updateFilter('location', event.target.value)} placeholder="Ho Chi Minh City"/>
                        <Button type="submit">Search jobs</Button>
                    </form>
                    {suggestions.length > 0 && <div className={styles.autocomplete}>{suggestions.map((suggestion) => <button type="button" key={`${suggestion.type}-${suggestion.text}`} onClick={() => {updateFilter('keyword', suggestion.text); setSuggestions([]);}}>{suggestion.text} <small>{suggestion.type}</small></button>)}</div>}
                </section>

                {!isAuthenticated && <div className={styles.notice}>You are viewing the latest public jobs. Sign in to use advanced search filters, open job details, save jobs, and apply.</div>}

                <div className={styles.listingLayout}>
                    <aside className={styles.filterPanel}>
                        <h2>Filter jobs</h2>
                        <Input label="Minimum salary" name="job-filter-salary-min" type="number" min="0" value={filters.salaryMin} onChange={(event) => updateFilter('salaryMin', event.target.value)} disabled={!isAuthenticated}/>
                        <Input label="Maximum salary" name="job-filter-salary-max" type="number" min="0" value={filters.salaryMax} onChange={(event) => updateFilter('salaryMax', event.target.value)} disabled={!isAuthenticated}/>
                        <Select label="Level" name="job-filter-level" value={filters.level} onChange={(event) => updateFilter('level', event.target.value)} disabled={!isAuthenticated}>
                            <option value="">All levels</option>
                            {JOB_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                        </Select>
                        <Select label="Employment type" name="job-filter-employment" value={filters.employmentType} onChange={(event) => updateFilter('employmentType', event.target.value)} disabled={!isAuthenticated}>
                            <option value="">All types</option>
                            {EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                        </Select>
                        {isAuthenticated && <SkillSelector label="Skills" value={filters.skillIds} onChange={(skillIds) => updateFilter('skillIds', skillIds)}/>}
                        <Select label="Sort by" name="job-sort" value={filters.sortBy} onChange={(event) => updateFilter('sortBy', event.target.value)} disabled={!isAuthenticated}>
                            <option value="createdDate">Newest</option>
                            <option value="salaryMin">Minimum salary</option>
                            <option value="salaryMax">Maximum salary</option>
                            <option value="experienceYears">Experience</option>
                            <option value="title">Title</option>
                        </Select>
                        <div className={styles.filterActions}><Button onClick={() => submitSearch({preventDefault() {}})} disabled={!isAuthenticated}>Apply filters</Button><Button variant="secondary" onClick={resetFilters}>Reset</Button></div>
                    </aside>

                    <section className={styles.results}>
                        <div className={styles.resultSummary}><strong>{meta.total} jobs</strong><span>{isAuthenticated ? 'Search results' : 'Latest published jobs'}</span></div>
                        <ErrorMessage message={errorMessage}/>
                        {isLoading ? <LoadingState label="Loading jobs..."/> : jobs.length === 0 ? <div className={styles.empty}>No jobs match the current filters.</div> : jobs.map((job) => <JobCard key={getJobId(job)} job={job} saved={savedIds.has(getJobId(job))} onToggleFavorite={isCandidate ? toggleFavorite : null} favoriteBusy={favoriteBusyId === getJobId(job)}/>)}
                        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
                    </section>
                </div>
            </div>
        </main>
    );
}
