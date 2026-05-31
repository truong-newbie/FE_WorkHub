import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {cleanParams, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import {searchCompanies} from '../services/companyService.js';
import styles from '../../shared/ModulePage.module.css';

export default function CompanyListPage() {
    const [keyword, setKeyword] = useState('');
    const [appliedKeyword, setAppliedKeyword] = useState('');
    const [companies, setCompanies] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const loadCompanies = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await searchCompanies(cleanParams({keyword: appliedKeyword, pageNum: page, pageSize: 10}));
            const items = getItems(data);
            setCompanies(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load companies.');
        } finally {
            setIsLoading(false);
        }
    }, [appliedKeyword, page]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Company directory</p>
                        <h1>Explore Companies</h1>
                        <p>Discover verified employers and review their active job opportunities.</p>
                    </div>
                </header>
                <section className={styles.panel}>
                    <form className={styles.filters} onSubmit={(event) => {
                        event.preventDefault();
                        setPage(1);
                        setAppliedKeyword(keyword.trim());
                    }}>
                        <Input className={styles.grow} label="Search companies" name="companyKeyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Company name, city, country, or industry"/>
                        <Button type="submit">Search</Button>
                    </form>
                </section>
                <ErrorMessage message={errorMessage}/>
                {isLoading ? (
                    <LoadingState label="Loading companies..."/>
                ) : companies.length === 0 ? (
                    <div className={styles.empty}>No companies match your search.</div>
                ) : (
                    <>
                        <div className={styles.card_grid}>
                            {companies.map((company) => (
                                <article key={company.id} className={styles.card}>
                                    <div className={styles.card_header}>
                                        <div>
                                            <h2>{company.name}</h2>
                                            <p>{[company.city, company.country, company.industry].filter(Boolean).join(' | ') || 'Company information is being updated.'}</p>
                                        </div>
                                        {company.logo && <img src={company.logo} alt=""/>}
                                    </div>
                                    <p>{company.description || 'View the company profile for more information.'}</p>
                                    <div className={styles.actions}>
                                        <span className={company.verified ? styles.success_badge : styles.warning_badge}>{company.verified ? 'Verified' : 'Unverified'}</span>
                                        <Link className={styles.link} to={`/companies/${company.id}`}>View company</Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
                    </>
                )}
            </div>
        </main>
    );
}
