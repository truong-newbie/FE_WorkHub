import {useState} from 'react';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import {useToast} from '../../../components/ui/useToast';
import {buildAssessmentPayload, getAssessmentBasePath, getAssessmentSnapshot, saveAssessmentSnapshot, toDateTimeLocal, validateAssessmentForm} from '../assessmentUtils';
import {createAssessment, updateAssessment} from '../services/assessmentService';
import styles from '../Assessment.module.css';

export default function AssessmentFormPage() {
  const {jobId, testId} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {showToast} = useToast();
  const basePath = getAssessmentBasePath(location.pathname);
  const snapshot = testId ? getAssessmentSnapshot(testId) : null;
  const [form, setForm] = useState({
    title: snapshot?.title || '',
    description: snapshot?.description || '',
    durationMinutes: snapshot?.durationMinutes || 45,
    startAt: toDateTimeLocal(snapshot?.startAt),
    endAt: toDateTimeLocal(snapshot?.endAt),
  });
  const [errorMessage, setErrorMessage] = useState(testId && !snapshot ? 'This test is not available in the local workspace. The backend does not expose a recruiter detail API yet.' : '');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const validationMessage = validateAssessmentForm(form);
    if (validationMessage) return setErrorMessage(validationMessage);
    setIsSaving(true);
    setErrorMessage('');
    try {
      const result = testId ? await updateAssessment(testId, buildAssessmentPayload(form)) : await createAssessment(jobId, buildAssessmentPayload(form));
      saveAssessmentSnapshot(result);
      showToast({message: testId ? 'Assessment updated.' : 'Assessment created.', type: 'success'});
      navigate(`${basePath}/${result.id}`);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save assessment.');
    } finally {
      setIsSaving(false);
    }
  };

  return <main className={styles.page}>
    <header className={styles.header}><div><h1>{testId ? 'Edit assessment' : 'Create assessment'}</h1><p className={styles.subtle}>Configure the active window and time limit before publishing.</p></div><Link className={styles.linkButton} to={testId ? `${basePath}/${testId}` : basePath}>Back</Link></header>
    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    {(!testId || snapshot) && <form className={`${styles.panel} ${styles.stack}`} onSubmit={submit}>
      <div className={styles.field}><label htmlFor="assessment-title">Title</label><input id="assessment-title" value={form.title} onChange={(event) => setForm({...form, title: event.target.value})}/></div>
      <div className={styles.field}><label htmlFor="assessment-description">Description</label><textarea id="assessment-description" value={form.description} onChange={(event) => setForm({...form, description: event.target.value})}/></div>
      <div className={styles.grid}>
        <div className={styles.field}><label htmlFor="assessment-duration">Duration in minutes</label><input id="assessment-duration" type="number" min="1" value={form.durationMinutes} onChange={(event) => setForm({...form, durationMinutes: event.target.value})}/></div>
        <div className={styles.field}><label htmlFor="assessment-start">Start time</label><input id="assessment-start" type="datetime-local" value={form.startAt} onChange={(event) => setForm({...form, startAt: event.target.value})}/></div>
        <div className={styles.field}><label htmlFor="assessment-end">End time</label><input id="assessment-end" type="datetime-local" value={form.endAt} onChange={(event) => setForm({...form, endAt: event.target.value})}/></div>
      </div>
      <div className={styles.actions}><button className={styles.button} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save assessment'}</button></div>
    </form>}
  </main>;
}
