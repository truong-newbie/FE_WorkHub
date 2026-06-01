import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import LoadingState from '../../../components/ui/LoadingState';
import AssessmentStatusBadge from '../components/AssessmentStatusBadge';
import {formatDateTime, formatScore} from '../assessmentUtils';
import {getCandidateAssessmentResult} from '../services/assessmentService';
import styles from '../Assessment.module.css';

export default function CandidateAssessmentResultPage() {
  const {assignmentId} = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getCandidateAssessmentResult(assignmentId).then(setResult).catch((error) => setErrorMessage(error.message || 'Unable to load your assessment result.')).finally(() => setIsLoading(false));
  }, [assignmentId]);

  if (isLoading) return <LoadingState label="Loading result..."/>;
  if (!result) return <main className={styles.page}><div className={styles.error}>{errorMessage}</div><Link className={styles.linkButton} to="/candidate/assessments">Back to assessments</Link></main>;

  const pendingReview = result.answers?.some((answer) => answer.score === null || answer.score === undefined);

  return <main className={styles.page}>
    <header className={styles.header}><div><div className={styles.actions}><AssessmentStatusBadge status={result.status}/></div><h1>{result.testTitle}</h1><p className={styles.subtle}>Submitted {formatDateTime(result.submittedAt)}</p></div><div><strong>{formatScore(result.totalScore, result.maxScore)}</strong></div></header>
    {pendingReview && <div className={styles.notice}>One or more essay answers are awaiting recruiter review. Your total score may change after grading.</div>}
    {result.recruiterFeedback && <div className={styles.panel}><h2>Recruiter feedback</h2><p>{result.recruiterFeedback}</p></div>}
    <section className={styles.questionList}>{result.answers?.map((answer) => <article className={styles.questionCard} key={answer.id}><div className={styles.questionHeading}><h3>{answer.questionContent}</h3><strong>{formatScore(answer.score, answer.maxScore)}</strong></div><p className={styles.answerText}>{answer.essayAnswer ?? answer.selectedOptionContent ?? 'No answer returned.'}</p>{answer.feedback && <p className={styles.subtle}>Feedback: {answer.feedback}</p>}</article>)}</section>
    <div><Link className={styles.linkButton} to="/candidate/assessments">Back to assessments</Link></div>
  </main>;
}
