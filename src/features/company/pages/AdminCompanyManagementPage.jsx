import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import Table from '../../../components/ui/Table.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import {
    approveCompany,
    disableCompany,
    enableCompany,
    rejectCompany,
    searchCompanies,
} from '../services/companyService.js';
import styles from './AdminCompanyManagementPage.module.css';

export default function AdminCompanyManagementPage() {
    const {showToast} = useToast();
    const [keyword, setKeyword] = useState('');
    const [appliedKeyword, setAppliedKeyword] = useState('');
    const [companies, setCompanies] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [actionCompanyId, setActionCompanyId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const loadCompanies = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await searchCompanies({
                pageNum: page,
                pageSize,
                keyword: appliedKeyword || undefined,
            });
            const items = getItems(data);
            setCompanies(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            const message = error.message || 'Unable to load companies.';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsLoading(false);
        }
    }, [appliedKeyword, page, pageSize, showToast]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setAppliedKeyword(keyword.trim());
    };

    const handleModerate = async (company, action) => {
        if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} company "${company.name}"?`)) {
            return;
        }

        setActionCompanyId(company.id);

        try {
            if (action === 'approve') {
                await approveCompany(company.id);
            } else if (action === 'enable') {
                await enableCompany(company.id);
            } else if (action === 'disable') {
                await disableCompany(company.id);
            } else {
                await rejectCompany(company.id);
            }

            showToast({message: `Company ${action} action completed.`, type: 'success'});
            await loadCompanies();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} company.`, type: 'error'});
        } finally {
            setActionCompanyId('');
        }
    };

    const columns = [
        {
            key: 'company',
            header: 'Company',
            render: (company) => (
                <div className={styles.companyCell}>
                    <strong>{company.name || `Company #${company.id}`}</strong>
                    <span>{company.email || company.website || 'No contact details'}</span>
                </div>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            render: (company) => [company.city, company.country].filter(Boolean).join(', ') || company.address || 'N/A',
        },
        {
            key: 'verified',
            header: 'Verification',
            render: (company) => (
                <span className={company.verified ? styles.approvedBadge : styles.pendingBadge}>
                    {company.verified ? 'Verified' : 'Waiting for verification'}
                </span>
            ),
        },
        {
            key: 'active',
            header: 'Status',
            render: (company) => (
                <span className={company.active ? styles.approvedBadge : styles.rejectedBadge}>
                    {company.active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (company) => (
                <div className={styles.actions}>
                    <Button
                        onClick={() => handleModerate(company, 'approve')}
                        disabled={actionCompanyId === company.id || company.verified}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => handleModerate(company, 'reject')}
                        disabled={actionCompanyId === company.id}
                    >
                        Reject
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleModerate(company, company.active ? 'disable' : 'enable')}
                        disabled={actionCompanyId === company.id}
                    >
                        {company.active ? 'Disable' : 'Enable'}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Company administration</p>
                        <h1>Company Management</h1>
                        <p>Review newly created companies before they are used for recruiting.</p>
                    </div>
                    <Button variant="secondary" onClick={loadCompanies} disabled={isLoading}>Refresh</Button>
                </header>

                <section className={styles.panel}>
                    <form className={styles.filters} onSubmit={handleSearch}>
                        <Input
                            label="Company keyword"
                            name="companyKeyword"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder="Search by company name or location"
                        />
                        <Select
                            label="Page size"
                            name="pageSize"
                            value={pageSize}
                            onChange={(event) => {
                                setPage(1);
                                setPageSize(Number(event.target.value));
                            }}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </Select>
                        <Button type="submit">Search</Button>
                    </form>
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>Companies</h2>
                            <p>{meta.total} records</p>
                        </div>
                    </div>
                    <ErrorMessage message={errorMessage}/>
                    {isLoading ? (
                        <LoadingState label="Loading companies..."/>
                    ) : (
                        <>
                            <Table columns={columns} rows={companies} getRowKey={(company) => company.id} emptyMessage="No companies found."/>
                            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
