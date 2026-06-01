import {useMemo} from 'react';
import {Link, useLocation} from 'react-router-dom';
import AssessmentStatusBadge from '../components/AssessmentStatusBadge';
import {formatDateTime, getAssessmentBasePath, getAssessmentJobsPath, readAssessmentSnapshots} from '../assessmentUtils';
import styles from '../Assessment.module.css';

export default function RecruiterAssessmentsPage() {
  const location = useLocation();
  const basePath = getAssessmentBasePath(location.pathname);
  const jobsPath = getAssessmentJobsPath(location.pathname);
  const tests = useMemo(() => readAssessmentSnapshots(), []);

  return <main className={styles.page}>
    <header className={styles.header}><div><h1>Assessment workspace</h1><p className={styles.subtle}>Create tests for job applications and review candidate results.</p></div><Link className={styles.button} to={jobsPath}>Choose a job</Link></header>
    <div className={styles.notice}>The backend does not provide a recruiter test-list API yet. This workspace shows server-returned tests created or edited in this browser.</div>
    {tests.length === 0 ? <div className={styles.panel}><p className={styles.empty}>No assessment snapshots are available. Choose a job and create its first test.</p></div> : <section className={styles.assessmentGrid}>{tests.map((test) => <article className={styles.assessmentCard} key={test.id}>
      <div className={styles.questionHeading}><h2>{test.title}</h2><AssessmentStatusBadge status={test.status}/></div>
      <p>{test.description || 'No description.'}</p>
      <div className={styles.meta}><span>{test.jobTitle || `Job #${test.jobId}`}</span><span>{test.questions?.length || 0} questions</span><span>{test.durationMinutes} minutes</span></div>
      <p className={styles.subtle}>{formatDateTime(test.startAt)} to {formatDateTime(test.endAt)}</p>
      <div className={styles.actions}><Link className={styles.linkButton} to={`${basePath}/${test.id}`}>Open</Link><Link className={styles.linkButton} to={`${basePath}/${test.id}/assign`}>Assign</Link><Link className={styles.linkButton} to={`${basePath}/${test.id}/results`}>Results</Link></div>
    </article>)}</section>}
  </main>;
}
