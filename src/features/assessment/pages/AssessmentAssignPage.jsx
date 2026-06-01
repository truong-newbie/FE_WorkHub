import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import LoadingState from '../../../components/ui/LoadingState';
import {useToast} from '../../../components/ui/useToast';
import {getJobApplications} from '../../job/services/jobService';
import {getItems} from '../../shared/moduleUtils';
import AssessmentStatusBadge from '../components/AssessmentStatusBadge';
import {getAssessmentBasePath, getAssessmentSnapshot} from '../assessmentUtils';
import {assignAssessment, getAssessmentAssignments} from '../services/assessmentService';
import styles from '../Assessment.module.css';

export default function AssessmentAssignPage() {
  const {testId} = useParams();
  const location = useLocation();
  const {showToast} = useToast();
  const basePath = getAssessmentBasePath(location.pathname);
  const test = useMemo(() => getAssessmentSnapshot(testId), [testId]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!test) return;
    setIsLoading(true);
    try {
      const [applicationData, assignmentData] = await Promise.all([
        getJobApplications(test.jobId, {page: 0, size: 100}),
        getAssessmentAssignments(test.id),
      ]);
      setApplications(getItems(applicationData));
      setAssignments(assignmentData || []);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load applications and assignments.');
    } finally {
      setIsLoading(false);
    }
  }, [test]);

  useEffect(() => { load(); }, [load]);

  if (!test) return <main className={styles.page}><div className={styles.error}>This test is not available in the local workspace.</div><Link className={styles.linkButton} to={basePath}>Back to assessments</Link></main>;

  const assignedApplicationIds = new Set(assignments.map((assignment) => String(assignment.applicationId)));
  const toggle = (applicationId) => setSelectedIds((current) => current.includes(applicationId) ? current.filter((id) => id !== applicationId) : [...current, applicationId]);

  const submit = async () => {
    if (!selectedIds.length) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      await assignAssessment(test.id, {applicationIds: selectedIds});
      setSelectedIds([]);
      showToast({message: 'Assessment assigned to selected candidates.', type: 'success'});
      await load();
    } catch (error) {
      setErrorMessage(error.message || 'Unable to assign assessment.');
    } finally {
      setIsSaving(false);
    }
  };

  return <main className={styles.page}>
    <header className={styles.header}><div><div className={styles.actions}><AssessmentStatusBadge status={test.status}/></div><h1>Assign {test.title}</h1><p className={styles.subtle}>Send this published assessment to eligible applications for {test.jobTitle || `job #${test.jobId}`}.</p></div><Link className={styles.linkButton} to={`${basePath}/${test.id}`}>Back to test</Link></header>
    {test.status !== 'PUBLISHED' && <div className={styles.notice}>Publish this assessment before assigning it to candidates.</div>}
    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    <section className={styles.panel}><h2>Eligible applications</h2>{isLoading ? <LoadingState label="Loading applications..."/> : applications.length === 0 ? <p className={styles.empty}>No applications are available for this job.</p> : <div className={styles.stack}>{applications.map((application) => {
      const assigned = assignedApplicationIds.has(String(application.id));
      const rejected = application.status === 'REJECTED';
      const disabled = assigned || rejected || test.status !== 'PUBLISHED';
      return <label className={styles.optionRow} key={application.id}><input type="checkbox" checked={selectedIds.includes(application.id)} disabled={disabled} onChange={() => toggle(application.id)}/><span className={styles.grow}>{application.candidate?.username || application.candidate?.email || `Application #${application.id}`}</span><span className={styles.subtle}>{assigned ? 'Already assigned' : rejected ? 'Rejected' : application.status}</span></label>;
    })}</div>}<div className={styles.actions}><button className={styles.button} disabled={isSaving || !selectedIds.length || test.status !== 'PUBLISHED'} onClick={submit}>{isSaving ? 'Assigning...' : `Assign selected (${selectedIds.length})`}</button></div></section>
    <section className={styles.panel}><h2>Current assignments</h2>{assignments.length === 0 ? <p className={styles.empty}>No candidates have been assigned yet.</p> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Candidate</th><th>Email</th><th>Status</th><th>Score</th></tr></thead><tbody>{assignments.map((assignment) => <tr key={assignment.id}><td>{assignment.candidateName}</td><td>{assignment.candidateEmail}</td><td><AssessmentStatusBadge status={assignment.status}/></td><td>{assignment.totalScore ?? 0} / {assignment.maxScore ?? 0}</td></tr>)}</tbody></table></div>}</section>
  </main>;
}
