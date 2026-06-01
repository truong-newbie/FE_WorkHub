import {useCallback, useEffect, useRef, useState} from 'react';
import {FaBriefcase, FaBuilding, FaCalendarAlt, FaMapMarkerAlt, FaUsers} from 'react-icons/fa';
import {Link, useParams} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Select from '../../../components/ui/Select.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {useAuth} from '../../../stores/useAuth.js';
import {getMyResumes} from '../../resume/services/resumeService.js';
import {formatDate, getItems} from '../../shared/moduleUtils.js';
import {formatJobSalary, getCompanyLogo, getCompanyName, getJobId, getJobSkills} from '../jobUtils.js';
import {trackJobView} from '../../recommendation/services/recommendationService.js';
import {applyJob, getJobById, getMyApplications, getSavedJobs, saveJob, unsaveJob, withdrawJobApplication} from '../services/jobService.js';
import JobStatusBadge from '../components/JobStatusBadge.jsx';
import styles from '../components/Job.module.css';

export default function JobDetailPage() {
    const {id} = useParams();
    const {showToast} = useToast();
    const {accessToken, isAuthenticated, roles} = useAuth();
    const isCandidate = roles.includes('CANDIDATE');
    const trackedViewRef = useRef('');
    const [job, setJob] = useState(null);
    const [application, setApplication] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [resumes, setResumes] = useState([]);
    const [resumeId, setResumeId] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadJob = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const jobData = await getJobById(id, {skipAuth: true, skipAuthCleanup: true});
            if (isCandidate && (!jobData.published || jobData.deleted)) {
                setJob(null);
                setErrorMessage('This job is not available for candidate access.');
                return;
            }
            setJob(jobData);
            if (accessToken && trackedViewRef.current !== String(id)) {
                trackedViewRef.current = String(id);
                trackJobView(id).catch(() => {});
            }
            if (isCandidate) {
                const [favoritesData, applicationsData, resumesData] = await Promise.all([
                    getSavedJobs({page: 0, size: 100}, {skipAuthCleanup: true}).catch(() => ({items: []})),
                    getMyApplications({page: 0, size: 100}, {skipAuthCleanup: true}).catch(() => ({items: []})),
                    getMyResumes({page: 0, size: 100}, {skipAuthCleanup: true}).catch(() => ({items: []})),
                ]);
                const resumeItems = getItems(resumesData);
                setIsSaved(getItems(favoritesData).some((favorite) => String(getJobId(favorite.job)) === String(id)));
                setApplication(getItems(applicationsData).find((item) => String(getJobId(item.job)) === String(id)) || null);
                setResumes(resumeItems);
                setResumeId((current) => resumeItems.some((resume) => String(resume.id) === current)
                    ? current
                    : String(resumeItems.find((resume) => resume.isDefault)?.id || resumeItems[0]?.id || ''));
            }
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load job detail.');
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, id, isCandidate]);

    useEffect(() => { loadJob(); }, [loadJob]);

    const toggleFavorite = async () => {
        setIsSaving(true);
        try {
            if (isSaved) await unsaveJob(id); else await saveJob(id);
            setIsSaved((current) => !current);
            showToast({message: isSaved ? 'Job removed from saved jobs.' : 'Job saved.', type: 'success'});
        } catch (error) {
            showToast({message: error.message || 'Unable to update saved job.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const submitApplication = async (event) => {
        event.preventDefault();
        if (!resumeId) {
            setErrorMessage('Choose a resume before applying.');
            return;
        }
        setIsSaving(true);
        try {
            await applyJob(id, {
                resumeId: Number(resumeId),
                ...(coverLetter.trim() ? {coverLetter: coverLetter.trim()} : {}),
            });
            setCoverLetter('');
            showToast({message: 'Application submitted.', type: 'success'});
            await loadJob();
        } catch (error) {
            showToast({message: error.message || 'Unable to submit application.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const withdraw = async () => {
        if (!window.confirm('Withdraw this pending application?')) return;
        setIsSaving(true);
        try {
            await withdrawJobApplication(id);
            showToast({message: 'Application withdrawn.', type: 'success'});
            await loadJob();
        } catch (error) {
            showToast({message: error.message || 'Unable to withdraw application.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <main className={styles.page}><LoadingState label="Loading job detail..."/></main>;
    if (!job) return <main className={styles.page}><div className={styles.container}><ErrorMessage message={errorMessage || 'Job not found.'}/></div></main>;

    const company = job.company || {};
    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <ErrorMessage message={errorMessage}/>
                <header className={`${styles.detailHeader} ${styles.panel}`}>
                    <div className={styles.detailHeaderMain}>
                        <div className={styles.companyLogo}>{getCompanyLogo(job) ? <img src={getCompanyLogo(job)} alt=""/> : <FaBuilding/>}</div>
                        <div><p className={styles.eyebrow}>Job opportunity</p><h1>{job.title}</h1><p className={styles.companyName}>{getCompanyName(job)}</p><div className={styles.detailMeta}><span><FaMapMarkerAlt/>{job.location}</span><span><FaBriefcase/>{job.level} | {job.employmentType || 'Flexible'}</span><span><FaCalendarAlt/>Posted {formatDate(job.createdDate)}</span></div></div>
                    </div>
                    <JobStatusBadge job={job}/>
                </header>

                <div className={styles.detailLayout}>
                    <div>
                        <section className={styles.detailPanel}><h2>Job description</h2><p className={styles.detailText}>{job.description}</p></section>
                        <section className={styles.detailPanel}><h2>Requirements</h2><p className={styles.detailText}>{job.requirement || 'The recruiter has not provided detailed requirements yet.'}</p></section>
                        <section className={styles.detailPanel}><h2>Benefits</h2><p className={styles.detailText}>{job.benefit || 'Benefit details will be discussed during the recruitment process.'}</p></section>
                        <section className={styles.detailPanel}><h2>Skills</h2><div className={styles.tags}>{getJobSkills(job).length > 0 ? getJobSkills(job).map((skill) => <span key={skill}>{skill}</span>) : <span>Skills will be discussed</span>}</div></section>
                    </div>
                    <aside>
                        <section className={styles.stickyPanel}>
                            <h2>{formatJobSalary(job)}</h2>
                            <dl className={styles.infoList}>
                                <div><dt>Experience</dt><dd>{job.experienceYears ?? 0} years</dd></div>
                                <div><dt>Open positions</dt><dd><FaUsers/> {job.quantity || 1}</dd></div>
                                <div><dt>Start date</dt><dd>{job.startDate || 'Not specified'}</dd></div>
                                <div><dt>Deadline</dt><dd>{job.expiredAt?.slice(0, 10) || 'Not specified'}</dd></div>
                            </dl>
                            {isCandidate ? (
                                <>
                                    <div className={styles.actions}><Button variant="secondary" onClick={toggleFavorite} disabled={isSaving}>{isSaved ? 'Remove saved job' : 'Save job'}</Button></div>
                                    {application ? <div className={styles.notice}>Application status: <strong>{application.status}</strong>{application.status === 'PENDING' && <div className={styles.actions}><Button variant="secondary" onClick={withdraw} disabled={isSaving}>Withdraw application</Button></div>}</div> : resumes.length === 0 ? <div className={styles.notice}>Upload a resume before applying. <Link className={styles.companyLink} to="/candidate/resumes">Manage resumes</Link></div> : <form className={styles.applyForm} onSubmit={submitApplication}><Select label="Resume *" name="application-resume" value={resumeId} onChange={(event) => {setResumeId(event.target.value); setErrorMessage('');}} required><option value="">Choose a resume</option>{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.title}{resume.isDefault ? ' (Default)' : ''}</option>)}</Select><label className={styles.textareaField}><span>Cover letter (optional)</span><textarea rows="5" value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} placeholder="Briefly explain why you are suitable for this position."/></label><Button type="submit" disabled={isSaving || !job.published || job.expired}>{isSaving ? 'Submitting...' : 'Apply now'}</Button></form>}
                                </>
                            ) : isAuthenticated ? <div className={styles.notice}>Only candidate accounts can save and apply for jobs.</div> : <div className={styles.notice}><Link className={styles.companyLink} to="/login" state={{from: {pathname: `/jobs/${id}`}}}>Sign in</Link> with a candidate account to save or apply for this job.</div>}
                        </section>
                        <section className={styles.panel}><h2>About the company</h2><dl className={styles.infoList}><div><dt>Company</dt><dd>{getCompanyName(job)}</dd></div><div><dt>Address</dt><dd>{company.address || job.location || 'Not specified'}</dd></div>{company.website && <div><dt>Website</dt><dd>{company.website}</dd></div>}</dl>{company.id && <div className={styles.actions}><Link className={styles.companyLink} to={`/companies/${company.id}`}>View company profile</Link></div>}</section>
                    </aside>
                </div>
            </div>
        </main>
    );
}
