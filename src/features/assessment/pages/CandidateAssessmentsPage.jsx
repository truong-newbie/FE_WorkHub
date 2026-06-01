import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import LoadingState from '../../../components/ui/LoadingState';
import AssessmentStatusBadge from '../components/AssessmentStatusBadge';
import {formatDateTime, formatScore} from '../assessmentUtils';
import {getCandidateAssessments} from '../services/assessmentService';
import styles from '../Assessment.module.css';

export default function CandidateAssessmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getCandidateAssessments().then((data) => setAssignments(data || [])).catch((error) => setErrorMessage(error.message || 'Unable to load your assessments.')).finally(() => setIsLoading(false));
  }, []);

  return <main className={styles.page}>
    <header className={styles.header}><div><h1>My assessments</h1><p className={styles.subtle}>Complete recruiter assessments within their active windows.</p></div></header>
    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    {isLoading ? <LoadingState label="Loading assessments..."/> : assignments.length === 0 ? <div className={styles.panel}><p className={styles.empty}>No recruiter assessments have been assigned to you.</p></div> : <section className={styles.assessmentGrid}>{assignments.map((assignment) => <article className={styles.assessmentCard} key={assignment.id}>
      <div className={styles.questionHeading}><h2>{assignment.testTitle}</h2><AssessmentStatusBadge status={assignment.status}/></div>
      <p>{assignment.testDescription || 'No description.'}</p>
      <div className={styles.meta}><span>{assignment.durationMinutes} minutes</span><span>{formatScore(assignment.totalScore, assignment.maxScore)}</span></div>
      <p className={styles.subtle}>{formatDateTime(assignment.testStartAt)} to {formatDateTime(assignment.testEndAt)}</p>
      <div className={styles.actions}>{assignment.status === 'SUBMITTED' ? <Link className={styles.button} to={`/candidate/assessments/${assignment.id}/result`}>View result</Link> : <Link className={styles.button} to={`/candidate/assessments/${assignment.id}/take`}>{assignment.status === 'IN_PROGRESS' ? 'Continue assessment' : 'Open assessment'}</Link>}</div>
    </article>)}</section>}
  </main>;
}
