import {FaBriefcase, FaBuilding, FaClock, FaHeart, FaMapMarkerAlt, FaRegHeart} from 'react-icons/fa';
import {Link} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import {formatDate} from '../../shared/moduleUtils.js';
import {formatJobSalary, getCompanyLogo, getCompanyName, getJobId, getJobSkills} from '../jobUtils.js';
import JobStatusBadge from './JobStatusBadge.jsx';
import styles from './Job.module.css';

export default function JobCard({job, showStatus = false, saved = false, onToggleFavorite, onJobClick, favoriteBusy = false}) {
    const id = getJobId(job);
    const skills = getJobSkills(job).slice(0, 5);

    return (
        <article className={styles.jobCard}>
            <div className={styles.jobCardLogo}>
                {getCompanyLogo(job) ? <img src={getCompanyLogo(job)} alt=""/> : <FaBuilding/>}
            </div>
            <div className={styles.jobCardBody}>
                <div className={styles.jobCardTitleRow}>
                    <div>
                        <h2><Link to={`/jobs/${id}`} onClick={() => onJobClick?.(job)}>{job.title}</Link></h2>
                        <p className={styles.companyName}>{getCompanyName(job)}</p>
                    </div>
                    {showStatus && <JobStatusBadge job={job}/>}
                </div>
                <strong className={styles.salary}>{formatJobSalary(job)}</strong>
                <div className={styles.jobMeta}>
                    <span><FaMapMarkerAlt/>{job.location || 'Location pending'}</span>
                    <span><FaBriefcase/>{job.level || 'Level pending'}{job.employmentType ? ` | ${job.employmentType}` : ''}</span>
                    <span><FaClock/>{formatDate(job.createdDate)}</span>
                </div>
                {skills.length > 0 && <div className={styles.tags}>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
            </div>
            <div className={styles.jobCardActions}>
                {onToggleFavorite && (
                    <Button variant="secondary" onClick={() => onToggleFavorite(job)} disabled={favoriteBusy}>
                        {saved ? <FaHeart/> : <FaRegHeart/>}
                        {saved ? 'Saved' : 'Save'}
                    </Button>
                )}
                <Link className={styles.detailLink} to={`/jobs/${id}`} onClick={() => onJobClick?.(job)}>View job</Link>
            </div>
        </article>
    );
}
