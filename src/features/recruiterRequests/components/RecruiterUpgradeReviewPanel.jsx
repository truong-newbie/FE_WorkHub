import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import {formatRequestDate} from '../recruiterRequestUtils.js';
import RequestStatusBadge from './RequestStatusBadge.jsx';
import styles from './RecruiterRequestReviewPanel.module.css';

export default function RecruiterUpgradeReviewPanel({
    request,
    errorMessage,
    note,
    onNoteChange,
    onApprove,
    onReject,
    isSaving,
}) {
    if (errorMessage) {
        return <ErrorMessage message={errorMessage}/>;
    }

    if (!request) {
        return (
            <div className={styles.empty}>
                <h3>Select a recruiter request</h3>
                <p>Open a request from the list to review its details.</p>
            </div>
        );
    }

    return (
        <div className={styles.detail}>
            <div className={styles.heading}>
                <div>
                    <p className={styles.eyebrow}>Recruiter request #{request.id || 'N/A'}</p>
                    <h3>{request.user?.username || 'Candidate request'}</h3>
                    <p>{request.user?.email || 'No candidate email provided'}</p>
                </div>
                <RequestStatusBadge status={request.status}/>
            </div>

            <dl className={styles.details}>
                <div>
                    <dt>Current role</dt>
                    <dd>{request.user?.roleName || 'Not available'}</dd>
                </div>
                <div>
                    <dt>Submitted</dt>
                    <dd>{formatRequestDate(request.createdDate)}</dd>
                </div>
                <div>
                    <dt>Candidate message</dt>
                    <dd>{request.message || 'No message provided'}</dd>
                </div>
                {request.reviewedBy?.username && (
                    <div>
                        <dt>Reviewed by</dt>
                        <dd>{request.reviewedBy.username}</dd>
                    </div>
                )}
                {request.reviewNote && (
                    <div>
                        <dt>Review note</dt>
                        <dd>{request.reviewNote}</dd>
                    </div>
                )}
            </dl>

            {request.status === 'PENDING' ? (
                <div className={styles.reviewBox}>
                    <label htmlFor="upgrade-review-note">
                        Review note <small>Optional, maximum 1000 characters</small>
                        <textarea
                            id="upgrade-review-note"
                            value={note}
                            maxLength="1000"
                            onChange={(event) => onNoteChange(event.target.value)}
                            placeholder="Add context for the candidate."
                            rows="4"
                            disabled={isSaving}
                        />
                    </label>
                    <div className={styles.actions}>
                        <Button variant="danger" onClick={onReject} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Reject request'}
                        </Button>
                        <Button onClick={onApprove} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Approve request'}
                        </Button>
                    </div>
                </div>
            ) : (
                <p className={styles.processed}>This recruiter request has already been processed.</p>
            )}
        </div>
    );
}
