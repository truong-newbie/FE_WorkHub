import {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import {formatDate, openDownload} from '../../shared/moduleUtils.js';
import {getCandidateResume, getCandidateResumeDownload} from '../services/resumeService.js';
import styles from '../../shared/ModulePage.module.css';

export default function RecruiterCandidateResumePage() {
    const {jobId, candidateId} = useParams();
    const [resume, setResume] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const loadResume = useCallback(async () => {
        setIsLoading(true);
        try {
            setResume(await getCandidateResume(jobId, candidateId));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load candidate resume.');
        } finally {
            setIsLoading(false);
        }
    }, [candidateId, jobId]);

    useEffect(() => {
        loadResume();
    }, [loadResume]);

    if (isLoading) return <LoadingState label="Loading candidate resume..."/>;

    return (
        <main className={styles.page}><div className={styles.container}>
            <header className={styles.header}><div><p className={styles.eyebrow}>Applicant resume</p><h1>{resume?.title || 'Candidate Resume'}</h1><p>Job #{jobId} | Candidate {candidateId}</p></div></header>
            <ErrorMessage message={errorMessage}/>
            {resume && <section className={styles.panel}>
                <dl className={styles.details}>
                    <div><dt>Candidate</dt><dd>{resume.candidate?.username || resume.candidate?.email || candidateId}</dd></div>
                    <div><dt>File</dt><dd>{resume.fileName || 'Not available'}</dd></div>
                    <div><dt>Uploaded</dt><dd>{formatDate(resume.uploadedAt)}</dd></div>
                    <div><dt>ATS score</dt><dd>{resume.atsScore ?? 'Pending analysis'}</dd></div>
                    <div><dt>Summary</dt><dd>{resume.summary || 'No summary provided'}</dd></div>
                </dl>
                <Button onClick={async () => openDownload((await getCandidateResumeDownload(jobId, candidateId)).fileUrl)}>Download resume</Button>
            </section>}
        </div></main>
    );
}
