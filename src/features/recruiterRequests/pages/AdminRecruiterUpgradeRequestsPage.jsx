import {useCallback, useEffect, useMemo, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import Table from '../../../components/ui/Table.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import RecruiterUpgradeReviewPanel from '../components/RecruiterUpgradeReviewPanel.jsx';
import RequestStatusBadge from '../components/RequestStatusBadge.jsx';
import {cleanParams, formatRequestDate, getItems, getPaginationMeta} from '../recruiterRequestUtils.js';
import {
    approveRecruiterUpgradeRequest,
    getRecruiterUpgradeRequests,
    rejectRecruiterUpgradeRequest,
} from '../services/recruiterRequestService.js';
import styles from './ReviewerRecruiterRequestsPage.module.css';

export default function AdminRecruiterUpgradeRequestsPage() {
    const {showToast} = useToast();
    const [status, setStatus] = useState('PENDING');
    const [appliedStatus, setAppliedStatus] = useState('PENDING');
    const [requests, setRequests] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadRequests = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getRecruiterUpgradeRequests(cleanParams({
                status: appliedStatus,
                page: page - 1,
                size: pageSize,
            }));
            const items = getItems(data);
            setRequests(items);
            setMeta(getPaginationMeta(data, items.length));
            setSelectedRequest((current) => items.find((item) => item.id === current?.id) || null);
        } catch (error) {
            const message = error.message || 'Unable to load recruiter requests.';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsLoading(false);
        }
    }, [appliedStatus, page, pageSize, showToast]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const columns = useMemo(() => [
        {
            key: 'candidate',
            header: 'Candidate',
            render: (request) => (
                <div className={styles.candidateCell}>
                    <strong>{request.user?.username || `Candidate #${request.user?.id || 'N/A'}`}</strong>
                    <span>{request.user?.email || 'No email provided'}</span>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Current role',
            render: (request) => request.user?.roleName || 'N/A',
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

    const handleFilter = (event) => {
        event.preventDefault();
        setPage(1);
        setAppliedStatus(status);
    };

    const handleReview = async (action) => {
        if (!selectedRequest || !window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this recruiter request?`)) {
            return;
        }

        setIsSaving(true);

        try {
            const reviewNote = note.trim();
            const payload = reviewNote ? {reviewNote} : {};

            if (action === 'approve') {
                await approveRecruiterUpgradeRequest(selectedRequest.id, payload);
            } else {
                await rejectRecruiterUpgradeRequest(selectedRequest.id, payload);
            }

            showToast({message: `Recruiter request ${action === 'approve' ? 'approved' : 'rejected'}.`, type: 'success'});
            setNote('');
            await loadRequests();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} recruiter request.`, type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Recruiter access</p>
                        <h1>Recruiter Upgrade Requests</h1>
                        <p>Review candidate requests before granting recruiter permissions.</p>
                    </div>
                    <Button variant="secondary" onClick={loadRequests} disabled={isLoading}>Refresh</Button>
                </header>

                <section className={styles.filterPanel}>
                    <form className={styles.filters} onSubmit={handleFilter}>
                        <Select label="Status" name="status" value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </Select>
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
                        <Button type="submit">Apply filters</Button>
                    </form>
                </section>

                <div className={styles.contentGrid}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Requests</h2>
                                <p>{meta.total} records</p>
                            </div>
                        </div>
                        <ErrorMessage message={errorMessage}/>
                        {isLoading ? (
                            <LoadingState label="Loading recruiter requests..."/>
                        ) : (
                            <>
                                <Table columns={columns} rows={requests} getRowKey={(request) => request.id} emptyMessage="No recruiter requests found."/>
                                <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
                            </>
                        )}
                    </section>

                    <aside className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Request detail</h2>
                                <p>Approval updates the candidate role to recruiter.</p>
                            </div>
                        </div>
                        <RecruiterUpgradeReviewPanel
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
