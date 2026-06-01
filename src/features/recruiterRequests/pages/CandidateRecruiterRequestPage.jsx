import {useCallback, useEffect, useMemo, useState} from 'react';
import {FaBriefcase, FaCheckCircle, FaFileAlt, FaUsers} from 'react-icons/fa';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import RequestStatusBadge from '../components/RequestStatusBadge.jsx';
import {formatRequestDate, getItems} from '../recruiterRequestUtils.js';
import {
    createRecruiterUpgradeRequest,
    getMyRecruiterUpgradeRequests,
} from '../services/recruiterRequestService.js';
import styles from './CandidateRecruiterRequestPage.module.css';

export default function CandidateRecruiterRequestPage() {
    const {showToast} = useToast();
    const [message, setMessage] = useState('');
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const pendingRequest = useMemo(
        () => requests.find((request) => request.status === 'PENDING'),
        [requests],
    );

    const latestRequest = requests[0];

    const loadRequests = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getMyRecruiterUpgradeRequests({page: 0, size: 10});
            setRequests(getItems(data));
        } catch (error) {
            const nextMessage = error.message || 'Unable to load recruiter requests.';
            setErrorMessage(nextMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedMessage = message.trim();

        if (trimmedMessage.length > 1000) {
            setErrorMessage('Your message must not exceed 1000 characters.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await createRecruiterUpgradeRequest(trimmedMessage ? {message: trimmedMessage} : {});
            setMessage('');
            showToast({message: 'Recruiter request submitted successfully.', type: 'success'});
            await loadRequests();
        } catch (error) {
            const nextMessage = error.message || 'Unable to submit recruiter request.';
            setErrorMessage(nextMessage);
            showToast({message: nextMessage, type: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <p className={styles.eyebrow}>Recruiter access</p>
                    <h1>Become a Recruiter</h1>
                    <p>Submit a request to unlock recruiter tools for your WorkHub account.</p>
                </header>

                <section className={styles.infoCard}>
                    <div className={styles.infoIcon}><FaBriefcase/></div>
                    <div>
                        <h2>Tools for a professional hiring process</h2>
                        <p>Recruiter accounts can publish jobs, manage candidates, and connect to a company hiring workflow.</p>
                        <div className={styles.benefits}>
                            <span><FaFileAlt/> Publish job openings</span>
                            <span><FaUsers/> Manage candidates</span>
                            <span><FaCheckCircle/> Review applications</span>
                        </div>
                    </div>
                </section>

                <div className={styles.contentGrid}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Your latest request</h2>
                                <p>Track your recruiter upgrade request status here.</p>
                            </div>
                            <Button variant="secondary" onClick={loadRequests} disabled={isLoading}>Refresh</Button>
                        </div>

                        {isLoading ? (
                            <LoadingState label="Loading recruiter request history..."/>
                        ) : errorMessage && requests.length === 0 ? (
                            <ErrorMessage message={errorMessage}/>
                        ) : latestRequest ? (
                            <div className={styles.statusCard}>
                                <div className={styles.statusHeading}>
                                    <RequestStatusBadge status={latestRequest.status}/>
                                    <span>Request #{latestRequest.id || 'N/A'}</span>
                                </div>
                                <dl className={styles.details}>
                                    <div>
                                        <dt>Submitted</dt>
                                        <dd>{formatRequestDate(latestRequest.createdDate)}</dd>
                                    </div>
                                    <div>
                                        <dt>Your message</dt>
                                        <dd>{latestRequest.message || 'No message provided'}</dd>
                                    </div>
                                    {latestRequest.reviewNote && (
                                        <div>
                                            <dt>Review note</dt>
                                            <dd>{latestRequest.reviewNote}</dd>
                                        </div>
                                    )}
                                </dl>
                                {latestRequest.status === 'PENDING' && (
                                    <p className={styles.statusNotice}>Your request is waiting for administrator review.</p>
                                )}
                                {latestRequest.status === 'REJECTED' && (
                                    <p className={styles.rejectedNotice}>You can update your message and submit a new request.</p>
                                )}
                                {latestRequest.status === 'APPROVED' && (
                                    <p className={styles.approvedNotice}>
                                        Your recruiter request was approved. Sign out and sign in again to activate recruiter permissions.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <h3>No recruiter request yet</h3>
                                <p>Tell the administrator why recruiter access is relevant to your work.</p>
                            </div>
                        )}
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Submit recruiter request</h2>
                                <p>{pendingRequest ? 'You already have a pending request.' : 'The message is optional.'}</p>
                            </div>
                        </div>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <label className={styles.textareaField} htmlFor="recruiter-request-message">
                                <span>Message <small>Optional, maximum 1000 characters</small></span>
                                <textarea
                                    id="recruiter-request-message"
                                    rows="6"
                                    maxLength="1000"
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    placeholder="Explain how you plan to use recruiter features."
                                    disabled={Boolean(pendingRequest) || isSubmitting}
                                />
                            </label>
                            <ErrorMessage message={errorMessage}/>
                            <Button type="submit" disabled={Boolean(pendingRequest) || isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit recruiter request'}
                            </Button>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}
