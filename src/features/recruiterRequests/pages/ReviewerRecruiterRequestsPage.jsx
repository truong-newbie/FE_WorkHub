import {useCallback, useEffect, useMemo, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import Table from '../../../components/ui/Table.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getCurrentUserProfile} from '../../user/services/userService.js';
import RecruiterRequestReviewPanel from '../components/RecruiterRequestReviewPanel.jsx';
import RequestStatusBadge from '../components/RequestStatusBadge.jsx';
import {formatRequestDate, getItems, getPaginationMeta} from '../recruiterRequestUtils.js';
import {
    approveCompanyJoinRequest,
    getCompanyJoinRequests,
    rejectCompanyJoinRequest,
} from '../services/recruiterRequestService.js';
import styles from './ReviewerRecruiterRequestsPage.module.css';

export default function ReviewerRecruiterRequestsPage({reviewer = 'company'}) {
    const isAdmin = reviewer === 'admin';
    const {showToast} = useToast();
    const [companyIdInput, setCompanyIdInput] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [requests, setRequests] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(!isAdmin);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadRequests = useCallback(async () => {
        if (!companyId) {
            setRequests([]);
            setMeta({total: 0, totalPages: 1});
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getCompanyJoinRequests(companyId, {page: page - 1, size: pageSize});
            const items = getItems(data);
            setRequests(items);
            setMeta(getPaginationMeta(data, items.length));
            setSelectedRequest((current) => items.find((item) => item.id === current?.id) || null);
        } catch (error) {
            const message = error.message || 'Unable to load company join requests.';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsLoading(false);
        }
    }, [companyId, page, pageSize, showToast]);

    useEffect(() => {
        if (isAdmin) {
            return;
        }

        const loadOwnerCompany = async () => {
            setIsLoading(true);

            try {
                const profile = await getCurrentUserProfile();

                if (!profile?.companyId) {
                    setErrorMessage('Your recruiter account is not linked to a company.');
                    return;
                }

                setCompanyId(String(profile.companyId));
            } catch (error) {
                setErrorMessage(error.message || 'Unable to load your company.');
            } finally {
                setIsLoading(false);
            }
        };

        loadOwnerCompany();
    }, [isAdmin]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const columns = useMemo(() => [
        {
            key: 'recruiter',
            header: 'Recruiter',
            render: (request) => (
                <div className={styles.candidateCell}>
                    <strong>{request.recruiter?.username || `Recruiter #${request.recruiter?.id || 'N/A'}`}</strong>
                    <span>{request.recruiter?.email || 'No email provided'}</span>
                </div>
            ),
        },
        {
            key: 'company',
            header: 'Company',
            render: (request) => request.company?.name || request.company?.id || 'N/A',
        },
        {
            key: 'status',
            header: 'Status',
            render: (request) => <RequestStatusBadge status={request.status}/>,
        },
        {
            key: 'submitted',
            header: 'Submitted',
            render: (request) => formatRequestDate(request.createdDate),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (request) => (
                <Button variant="secondary" onClick={() => {
                    setSelectedRequest(request);
                    setNote('');
                }}>
                    Review
                </Button>
            ),
        },
    ], []);

    const handleAdminCompanySubmit = (event) => {
        event.preventDefault();

        if (!/^\d+$/.test(companyIdInput) || Number(companyIdInput) < 1) {
            setErrorMessage('Enter a valid company ID.');
            return;
        }

        setPage(1);
        setCompanyId(companyIdInput);
    };

    const handleReview = async (action) => {
        if (!selectedRequest || !window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this company join request?`)) {
            return;
        }

        setIsSaving(true);

        try {
            const reviewNote = note.trim();
            const payload = reviewNote ? {reviewNote} : {};

            if (action === 'approve') {
                await approveCompanyJoinRequest(selectedRequest.id, payload);
            } else {
                await rejectCompanyJoinRequest(selectedRequest.id, payload);
            }

            showToast({message: `Company join request ${action === 'approve' ? 'approved' : 'rejected'}.`, type: 'success'});
            setNote('');
            await loadRequests();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} company join request.`, type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Company access</p>
                        <h1>Company Join Requests</h1>
                        <p>Review recruiters requesting access to an existing company.</p>
                    </div>
                    <Button variant="secondary" onClick={loadRequests} disabled={isLoading || !companyId}>Refresh</Button>
                </header>

                <section className={styles.filterPanel}>
                    {isAdmin ? (
                        <form className={styles.filters} onSubmit={handleAdminCompanySubmit}>
                            <Input
                                label="Company ID"
                                name="companyId"
                                inputMode="numeric"
                                value={companyIdInput}
                                onChange={(event) => setCompanyIdInput(event.target.value)}
                                placeholder="Enter company ID"
                            />
                            <Button type="submit">Load requests</Button>
                        </form>
                    ) : (
                        <p className={styles.ownerCompany}>Company ID: <strong>{companyId || 'Loading...'}</strong></p>
                    )}
                </section>

                <div className={styles.contentGrid}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Join requests</h2>
                                <p>{meta.total} records</p>
                            </div>
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
                        </div>
                        <ErrorMessage message={errorMessage}/>
                        {isLoading ? (
                            <LoadingState label="Loading company join requests..."/>
                        ) : (
                            <>
                                <Table
                                    columns={columns}
                                    rows={requests}
                                    getRowKey={(request) => request.id}
                                    emptyMessage={companyId ? 'No company join requests found.' : 'Choose a company to load join requests.'}
                                />
                                <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
                            </>
                        )}
                    </section>

                    <aside className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Request detail</h2>
                                <p>Approval links the recruiter to this company.</p>
                            </div>
                        </div>
                        <RecruiterRequestReviewPanel
                            request={selectedRequest}
                            errorMessage=""
                            note={note}
                            onNoteChange={setNote}
                            onApprove={() => handleReview('approve')}
                            onReject={() => handleReview('reject')}
                            isSaving={isSaving}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}
