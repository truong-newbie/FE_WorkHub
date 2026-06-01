import {useCallback, useEffect, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import LoadingState from '../../../components/ui/LoadingState';
import {useToast} from '../../../components/ui/useToast';
import {formatScore, getAssessmentBasePath} from '../assessmentUtils';
import {getAssessmentAnswers, gradeAssessmentAnswer} from '../services/assessmentService';
import styles from '../Assessment.module.css';

export default function AssessmentResultDetailPage() {
  const {assignmentId} = useParams();
  const location = useLocation();
  const {showToast} = useToast();
  const basePath = getAssessmentBasePath(location.pathname);
  const summary = location.state?.summary;
  const test = location.state?.test;
  const [answers, setAnswers] = useState([]);
  const [grades, setGrades] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAssessmentAnswers(assignmentId);
      setAnswers(data || []);
      setGrades(Object.fromEntries((data || []).map((answer) => [answer.id, {score: answer.score ?? '', feedback: answer.feedback || ''}])));
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load candidate answers.');
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => { load(); }, [load]);

  const grade = async (answer) => {
    const value = grades[answer.id] || {};
    if (value.score === '' || Number(value.score) < 0 || Number(value.score) > Number(answer.maxScore)) {
      setErrorMessage(`Score for "${answer.questionContent}" must be between 0 and ${answer.maxScore}.`);
      return;
    }
    setBusyId(answer.id);
    setErrorMessage('');
    try {
      await gradeAssessmentAnswer(answer.id, {score: Number(value.score), feedback: value.feedback.trim() || null});
      showToast({message: 'Essay score saved.', type: 'success'});
      await load();
    } catch (error) {
      setErrorMessage(error.message || 'Unable to grade answer.');
    } finally {
      setBusyId('');
    }
  };

  return <main className={styles.page}>
    <header className={styles.header}><div><h1>Candidate answers</h1><p className={styles.subtle}>{summary ? `${summary.candidateName} | ${formatScore(summary.totalScore, summary.maxScore)}` : `Assignment #${assignmentId}`}</p></div><Link className={styles.linkButton} to={test ? `${basePath}/${test.id}/results` : basePath}>Back to results</Link></header>
    {!summary && <div className={styles.notice}>Candidate summary is not included by the answers endpoint. Return through the result table to retain that context.</div>}
    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    {isLoading ? <LoadingState label="Loading answers..."/> : <section className={styles.questionList}>{answers.length === 0 ? <div className={styles.panel}><p className={styles.empty}>No submitted answers are available.</p></div> : answers.map((answer) => {
      const isEssay = answer.essayAnswer !== null && answer.essayAnswer !== undefined;
      const gradeValue = grades[answer.id] || {};
      return <article className={styles.questionCard} key={answer.id}><div className={styles.questionHeading}><h3>{answer.questionContent}</h3><strong>{formatScore(answer.score, answer.maxScore)}</strong></div><p className={styles.answerText}>{isEssay ? answer.essayAnswer || 'No essay answer.' : answer.selectedOptionContent || 'No option selected.'}</p>{answer.feedback && <p className={styles.subtle}>Feedback: {answer.feedback}</p>}{isEssay && <div className={styles.stack}><div className={styles.grid}><div className={styles.field}><label htmlFor={`score-${answer.id}`}>Essay score</label><input id={`score-${answer.id}`} type="number" min="0" max={answer.maxScore} step="0.01" value={gradeValue.score} onChange={(event) => setGrades({...grades, [answer.id]: {...gradeValue, score: event.target.value}})}/></div><div className={styles.field}><label htmlFor={`feedback-${answer.id}`}>Feedback</label><input id={`feedback-${answer.id}`} value={gradeValue.feedback} onChange={(event) => setGrades({...grades, [answer.id]: {...gradeValue, feedback: event.target.value}})}/></div></div><div><button className={styles.button} disabled={busyId === answer.id} onClick={() => grade(answer)}>Save grade</button></div></div>}</article>;
    })}</section>}
  </main>;
}
