import {useState} from 'react';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import {useToast} from '../../../components/ui/useToast';
import AssessmentQuestionForm from '../components/AssessmentQuestionForm';
import AssessmentStatusBadge from '../components/AssessmentStatusBadge';
import {formatDateTime, getAssessmentBasePath, getAssessmentSnapshot, removeAssessmentSnapshot, saveAssessmentSnapshot} from '../assessmentUtils';
import {closeAssessment, createAssessmentQuestion, deleteAssessment, deleteAssessmentQuestion, publishAssessment, updateAssessmentQuestion} from '../services/assessmentService';
import styles from '../Assessment.module.css';

export default function RecruiterAssessmentWorkspacePage() {
  const {testId} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {showToast} = useToast();
  const basePath = getAssessmentBasePath(location.pathname);
  const [test, setTest] = useState(() => getAssessmentSnapshot(testId));
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const persist = (nextTest) => {
    saveAssessmentSnapshot(nextTest);
    setTest(nextTest);
  };

  const runTestAction = async (action) => {
    if (action === 'delete' && !window.confirm(`Delete "${test.title}"?`)) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      if (action === 'delete') {
        await deleteAssessment(test.id);
        removeAssessmentSnapshot(test.id);
        navigate(basePath);
        return;
      }
      persist(action === 'publish' ? await publishAssessment(test.id) : await closeAssessment(test.id));
      showToast({message: `Assessment ${action} completed.`, type: 'success'});
    } catch (error) {
      setErrorMessage(error.message || `Unable to ${action} assessment.`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveQuestion = async (payload) => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const question = editingQuestion ? await updateAssessmentQuestion(editingQuestion.id, payload) : await createAssessmentQuestion(test.id, payload);
      const questions = editingQuestion ? (test.questions || []).map((item) => item.id === question.id ? question : item) : [...(test.questions || []), question];
      persist({...test, questions});
      setEditingQuestion(null);
      showToast({message: 'Question saved.', type: 'success'});
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save question.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeQuestion = async (question) => {
    if (!window.confirm('Delete this question?')) return;
    setIsSaving(true);
    try {
      await deleteAssessmentQuestion(question.id);
      persist({...test, questions: (test.questions || []).filter((item) => item.id !== question.id)});
      showToast({message: 'Question deleted.', type: 'success'});
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete question.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!test) return <main className={styles.page}><div className={styles.error}>This test is not available in the local workspace. The backend does not expose a recruiter detail API yet.</div><Link className={styles.linkButton} to={basePath}>Back to assessments</Link></main>;

  const isDraft = test.status === 'DRAFT';
  const questions = [...(test.questions || [])].sort((left, right) => left.orderIndex - right.orderIndex);
  const nextOrderIndex = Math.max(0, ...questions.map((question) => Number(question.orderIndex) || 0)) + 1;

  return <main className={styles.page}>
    <header className={styles.header}><div><div className={styles.actions}><AssessmentStatusBadge status={test.status}/><span className={styles.subtle}>{test.jobTitle || `Job #${test.jobId}`}</span></div><h1>{test.title}</h1><p>{test.description || 'No description.'}</p></div><div className={styles.actions}><Link className={styles.linkButton} to={basePath}>All tests</Link>{isDraft && <Link className={styles.linkButton} to={`${basePath}/${test.id}/edit`}>Edit</Link>}<Link className={styles.linkButton} to={`${basePath}/${test.id}/assign`}>Assign</Link><Link className={styles.linkButton} to={`${basePath}/${test.id}/results`}>Results</Link></div></header>
    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    <section className={styles.panel}><div className={styles.meta}><span>{test.durationMinutes} minutes</span><span>{formatDateTime(test.startAt)} to {formatDateTime(test.endAt)}</span><span>{questions.length} questions</span></div><div className={styles.actions}>{isDraft && <button className={styles.button} disabled={isSaving} onClick={() => runTestAction('publish')}>Publish</button>}{test.status === 'PUBLISHED' && <button className={styles.secondaryButton} disabled={isSaving} onClick={() => runTestAction('close')}>Close</button>}<button className={styles.dangerButton} disabled={isSaving} onClick={() => runTestAction('delete')}>Delete</button></div></section>
    {!isDraft && <div className={styles.notice}>The editor is locked after publishing. Candidate assignments and results remain available.</div>}
    {isDraft && <AssessmentQuestionForm question={editingQuestion} defaultOrderIndex={nextOrderIndex} onCancel={editingQuestion ? () => setEditingQuestion(null) : null} onSave={saveQuestion} isSaving={isSaving}/>}
    <section className={styles.questionList}>{questions.length === 0 ? <div className={styles.panel}><p className={styles.empty}>No questions yet. Add at least one valid question before publishing.</p></div> : questions.map((question) => <article className={styles.questionCard} key={question.id}>
      <div className={styles.questionHeading}><h3>{question.orderIndex}. {question.content}</h3><strong>{question.score} points</strong></div>
      <p className={styles.subtle}>{question.type === 'ESSAY' ? 'Essay answer, recruiter grading required' : 'Multiple choice, automatically graded'}</p>
      {question.options?.length > 0 && <ul className={styles.optionList}>{question.options.map((option) => <li className={styles.optionRow} key={option.id || option.content}>{option.content}{option.correct && <strong>Correct</strong>}</li>)}</ul>}
      {isDraft && <div className={styles.actions}><button className={styles.secondaryButton} onClick={() => setEditingQuestion(question)}>Edit</button><button className={styles.dangerButton} onClick={() => removeQuestion(question)}>Delete</button></div>}
    </article>)}</section>
  </main>;
}
