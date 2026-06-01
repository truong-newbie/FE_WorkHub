import {useCallback, useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import {getCompanyById, getCompanyJobs} from '../services/companyService.js';
import styles from '../../shared/ModulePage.module.css';

export default function CompanyDetailPage() {
    const {id} = useParams();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const loadCompany = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const [companyData, jobsData] = await Promise.all([
                getCompanyById(id, {skipAuth: true, skipAuthCleanup: true}),
                getCompanyJobs(id, {pageNum: page, pageSize: 10, sortBy: 'createdDate', isAscending: false}, {skipAuth: true, skipAuthCleanup: true}),
            ]);
            const jobItems = getItems(jobsData);
            setCompany(companyData);
            setJobs(jobItems);
            setMeta(getPaginationMeta(jobsData, jobItems.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load company profile.');
        } finally {
            setIsLoading(false);
        }
    }, [id, page]);

    useEffect(() => {
        loadCompany();
    }, [loadCompany]);

    if (isLoading) {
        return <LoadingState label="Loading company profile..."/>;
    }

    if (!company) {
        return <main className={styles.page}><div className={styles.container}><ErrorMessage message={errorMessage}/></div></main>;
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                {company.coverImage && <img className={styles.cover} src={company.coverImage} alt=""/>}
                <section className={styles.hero}>
                    <div className={styles.row}>
                        <div>
                            <p className={styles.eyebrow}>Company profile</p>
                            <h1>{company.name}</h1>
                            <p>{[company.city, company.country, company.industry].filter(Boolean).join(' | ') || company.address || 'Location not provided'}</p>
                        </div>
                        {company.logo && <img className={styles.logo} src={company.logo} alt=""/>}
                    </div>
                    <div className={styles.actions}>
                        <span className={company.verified ? styles.success_badge : styles.warning_badge}>{company.verified ? 'Verified employer' : 'Unverified'}</span>
                        <span className={company.active ? styles.success_badge : styles.danger_badge}>{company.active ? 'Active' : 'Inactive'}</span>
                    </div>
                </section>
                <div className={styles.grid}>
                    <section className={styles.panel}>
                        <div className={styles.panel_header}><div><h2>About the company</h2></div></div>
                        <p className={styles.muted}>{company.description || 'No company description is available yet.'}</p>
                        <dl className={styles.details}>
                            <div><dt>Website</dt><dd>{company.website ? <a className={styles.link} href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : 'Not available'}</dd></div>
                            <div><dt>Contact</dt><dd>{company.email || company.phone || 'Not available'}</dd></div>
                            <div><dt>Address</dt><dd>{company.address || 'Not available'}</dd></div>
                            <div><dt>Company size</dt><dd>{company.companySize || 'Not available'}</dd></div>
                        </dl>
                    </section>
                    <section className={styles.panel}>
                        <div className={styles.panel_header}><div><h2>Open positions</h2><p>{meta.total} jobs</p></div></div>
                        <div className={styles.stack}>
                            {jobs.length === 0 ? <div className={styles.empty}>No active jobs found.</div> : jobs.map((job) => (
                                <article key={job.id} className={styles.card}>
                                    <h3>{job.title}</h3>
                                    <p>{[job.location, job.level, job.employmentType].filter(Boolean).join(' | ')}</p>
                                    <Link className={styles.link} to={`/jobs/${job.id}`}>View job</Link>
                                </article>
                            ))}
                        </div>
                        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
                    </section>
                </div>
            </div>
        </main>
    );
}
