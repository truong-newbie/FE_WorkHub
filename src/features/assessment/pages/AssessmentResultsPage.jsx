import {useEffect, useMemo, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import LoadingState from '../../../components/ui/LoadingState';
import AssessmentStatusBadge from '../components/AssessmentStatusBadge';
import {formatDateTime, formatScore, getAssessmentBasePath, getAssessmentSnapshot} from '../assessmentUtils';
import {getAssessmentResults} from '../services/assessmentService';
import styles from '../Assessment.module.css';

export default function AssessmentResultsPage() {
  const {testId} = useParams();
  const location = useLocation();
  const basePath = getAssessmentBasePath(location.pathname);
  const test = useMemo(() => getAssessmentSnapshot(testId), [testId]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!test) return;
    getAssessmentResults(test.id).then((data) => setResults(data || [])).catch((error) => setErrorMessage(error.message || 'Unable to load assessment results.')).finally(() => setIsLoading(false));
  }, [test]);

  if (!test) return <main className={styles.page}><div className={styles.error}>This test is not available in the local workspace.</div><Link className={styles.linkButton} to={basePath}>Back to assessments</Link></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><h1>{test.title} results</h1><p className={styles.subtle}>Track assignment progress and review submitted answers.</p></div><Link className={styles.linkButton} to={`${basePath}/${test.id}`}>Back to test</Link></header>
    {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    <section className={styles.panel}>{isLoading ? <LoadingState label="Loading results..."/> : results.length === 0 ? <p className={styles.empty}>No assessment assignments are available yet.</p> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Candidate</th><th>Email</th><th>Status</th><th>Score</th><th>Submitted</th><th></th></tr></thead><tbody>{results.map((result) => <tr key={result.assignmentId}><td>{result.candidateName}</td><td>{result.candidateEmail}</td><td><AssessmentStatusBadge status={result.status}/></td><td>{formatScore(result.totalScore, result.maxScore)}</td><td>{formatDateTime(result.submittedAt)}</td><td><Link className={styles.linkButton} state={{summary: result, test}} to={`${basePath}/assignments/${result.assignmentId}/answers`}>Answers</Link></td></tr>)}</tbody></table></div>}</section>
  </main>;
}
