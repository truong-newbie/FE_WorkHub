import {createElement} from 'react';
import {Link} from 'react-router-dom';
import {
    FaArrowRight,
    FaBuilding,
    FaEnvelope,
    FaFileAlt,
    FaHandshake,
    FaShieldAlt,
    FaTools,
    FaUserTie,
    FaUsers,
} from 'react-icons/fa';
import {useAuth} from '../../../stores/useAuth.js';
import styles from './AdminDashboardPage.module.css';

const priorityActions = [
    {
        to: '/admin/recruiter-requests',
        label: 'Recruiter access',
        description: 'Review candidate upgrade requests before granting recruiter permissions.',
        icon: FaUserTie,
        tone: 'red',
    },
    {
        to: '/admin/companies',
        label: 'Company moderation',
        description: 'Approve company profiles and control their visibility on the platform.',
        icon: FaBuilding,
        tone: 'blue',
    },
    {
        to: '/admin/company-join-requests',
        label: 'Company memberships',
        description: 'Resolve requests from recruiters who want to join an existing company.',
        icon: FaHandshake,
        tone: 'amber',
    },
];

const modules = [
    {to: '/admin/users', label: 'Users', description: 'Accounts, roles and access status', icon: FaUsers},
    {to: '/admin/companies', label: 'Companies', description: 'Profiles, approval and visibility', icon: FaBuilding},
    {to: '/admin/skills', label: 'Skills', description: 'Shared platform taxonomy', icon: FaTools},
    {to: '/admin/resumes', label: 'Resumes', description: 'Candidate CV records and ATS state', icon: FaFileAlt},
    {to: '/admin/subscribers', label: 'Subscribers', description: 'Job alerts and email operations', icon: FaEnvelope},
    {to: '/admin/recruiter-requests', label: 'Recruiter requests', description: 'Role upgrade approval queue', icon: FaUserTie},
];

export default function AdminDashboardPage() {
    const {user} = useAuth();
    const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).format(new Date());

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div>
                    <p className={styles.eyebrow}>WorkHub Administration</p>
                    <h1>Control center</h1>
                    <p className={styles.heroDescription}>
                        Moderate platform activity, manage shared resources, and keep recruiter access under control.
                    </p>
                </div>
                <div className={styles.heroMeta}>
                    <span className={styles.status}><i/>Administration workspace</span>
                    <strong>{user?.username || user?.email || 'Administrator'}</strong>
                    <small>{today}</small>
                </div>
            </section>

            <section className={styles.introRow}>
                <div>
                    <p className={styles.sectionEyebrow}>Priority desk</p>
                    <h2>Operational review</h2>
                    <p>Start with the queues that affect recruiter onboarding and public company visibility.</p>
                </div>
                <FaShieldAlt className={styles.shield}/>
            </section>

            <section className={styles.priorityGrid}>
                {priorityActions.map(({to, label, description, icon, tone}) => (
                    <Link to={to} className={`${styles.priorityCard} ${styles[tone]}`} key={to}>
                        <div className={styles.priorityIcon}>{createElement(icon)}</div>
                        <h3>{label}</h3>
                        <p>{description}</p>
                        <span>Open workspace <FaArrowRight/></span>
                    </Link>
                ))}
            </section>

            <section className={styles.modulesSection}>
                <div className={styles.sectionHeader}>
                    <div>
                        <p className={styles.sectionEyebrow}>Directory</p>
                        <h2>Management modules</h2>
                    </div>
                    <span>{modules.length} active workspaces</span>
                </div>
                <div className={styles.moduleGrid}>
                    {modules.map(({to, label, description, icon}) => (
                        <Link to={to} className={styles.moduleCard} key={to}>
                            {createElement(icon)}
                            <div>
                                <strong>{label}</strong>
                                <p>{description}</p>
                            </div>
                            <FaArrowRight className={styles.arrow}/>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
