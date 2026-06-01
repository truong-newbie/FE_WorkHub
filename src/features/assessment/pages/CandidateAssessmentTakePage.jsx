import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import LoadingState from '../../../components/ui/LoadingState';
import {formatDateTime, formatRemaining, getAssignmentDeadline} from '../assessmentUtils';
import {getCandidateAssessmentDetail, getCandidateAssessments, startCandidateAssessment, submitCandidateAssessment} from '../services/assessmentService';
import styles from '../Assessment.module.css';

export default function CandidateAssessmentTakePage() {
  const {assignmentId} = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [now, setNow] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [assignments, detail] = await Promise.all([getCandidateAssessments(), getCandidateAssessmentDetail(assignmentId)]);
      setAssignment((assignments || []).find((item) => String(item.id) === String(assignmentId)) || null);
      setTest(detail);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load this assessment.');
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => { load(); }, [load]);

  const deadline = getAssignmentDeadline(assignment);
  const isActive = assignment?.status === 'IN_PROGRESS';
  const isExpired = Boolean(deadline && deadline <= now);

  useEffect(() => {
    if (!isActive) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    const warn = (event) => {
      if (isActive && Object.keys(answers).length) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [answers, isActive]);

  const questions = useMemo(() => [...(test?.questions || [])].sort((left, right) => left.orderIndex - right.orderIndex), [test]);

  const start = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      setAssignment(await startCandidateAssessment(assignmentId));
      setNow(Date.now());
    } catch (error) {
      setErrorMessage(error.message || 'Unable to start this assessment.');
    } finally {
      setIsSaving(false);
    }
  };

  const submit = async () => {
    const missingQuestion = questions.find((question) => {
      const answer = answers[question.id];
      return question.type === 'MULTIPLE_CHOICE' ? !answer?.selectedOptionId : !answer?.essayAnswer?.trim();
    });
    if (missingQuestion) return setErrorMessage('Answer every question before submitting the assessment.');
    if (!window.confirm('Submit your assessment? You cannot change answers after submission.')) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      await submitCandidateAssessment(assignmentId, {
        answers: questions.map((question) => ({questionId: question.id, ...answers[question.id]})),
      });
      navigate(`/candidate/assessments/${assignmentId}/result`);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to submit this assessment.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading assessment..."/>;
  if (!assignment || !test) return <main className={styles.page}><div className={styles.error}>{errorMessage || 'Assessment assignment was not found.'}</div><Link className={styles.linkButton} to="/candidate/assessments">Back to assessments</Link></main>;
  if (assignment.status === 'SUBMITTED') return <main className={styles.page}><div className={styles.notice}>This assessment has already been submitted.</div><Link className={styles.button} to={`/candidate/assessments/${assignmentId}/result`}>View result</Link></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><h1>{test.title}</h1><p>{test.description || 'No description.'}</p><div className={styles.meta}><span>{test.durationMinutes} minutes</span><span>{questions.length} questions</span><span>Available until {formatDateTime(test.endAt)}</span></div></div>{isActive && <div className={styles.timer}>{deadline ? formatRemaining(deadline - now) : '--:--:--'}</div>}</header>
    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    {!isActive ? <section className={styles.panel}><h2>Before you begin</h2><p>The timer starts when you click Start assessment. Complete the test in one session and submit before the active window closes.</p><button className={styles.button} disabled={isSaving || assignment.status === 'EXPIRED'} onClick={start}>{isSaving ? 'Starting...' : 'Start assessment'}</button></section> : <>
      {isExpired && <div className={styles.error}>The assessment deadline has passed. Submit is disabled because the backend will reject late submissions.</div>}
      <section className={styles.questionList}>{questions.map((question) => <article className={styles.questionCard} key={question.id}>
        <div className={styles.questionHeading}><h3>{question.orderIndex}. {question.content}</h3><strong>{question.score} points</strong></div>
        {question.type === 'MULTIPLE_CHOICE' ? <div className={styles.optionList}>{question.options?.map((option) => <label className={styles.optionRow} key={option.id}><input type="radio" name={`question-${question.id}`} checked={answers[question.id]?.selectedOptionId === option.id} onChange={() => setAnswers({...answers, [question.id]: {selectedOptionId: option.id}})}/><span>{option.content}</span></label>)}</div> : <div className={styles.field}><label htmlFor={`essay-${question.id}`}>Your answer</label><textarea id={`essay-${question.id}`} maxLength="10000" value={answers[question.id]?.essayAnswer || ''} onChange={(event) => setAnswers({...answers, [question.id]: {essayAnswer: event.target.value}})}/></div>}
      </article>)}</section>
      <div className={styles.actions}><button className={styles.button} disabled={isSaving || isExpired || !questions.length} onClick={submit}>{isSaving ? 'Submitting...' : 'Submit assessment'}</button><Link className={styles.linkButton} to="/candidate/assessments">Leave assessment</Link></div>
    </>}
  </main>;
}
