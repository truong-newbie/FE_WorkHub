import {createElement} from 'react';
import {NavLink} from 'react-router-dom';
import {
    FaBriefcase,
    FaBuilding,
    FaEnvelope,
    FaExternalLinkAlt,
    FaFileAlt,
    FaHandshake,
    FaTachometerAlt,
    FaTimes,
    FaTools,
    FaUserTie,
    FaUsers,
} from 'react-icons/fa';
import styles from './AdminSidebar.module.css';

const sections = [
    {
        title: 'Overview',
        items: [
            {to: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt},
        ],
    },
    {
        title: 'Management',
        items: [
            {to: '/admin/users', label: 'Users', icon: FaUsers},
            {to: '/admin/companies', label: 'Companies', icon: FaBuilding},
            {to: '/admin/jobs', label: 'Jobs', icon: FaBriefcase},
            {to: '/admin/skills', label: 'Skills', icon: FaTools},
            {to: '/admin/resumes', label: 'Resumes', icon: FaFileAlt},
            {to: '/admin/subscribers', label: 'Subscribers', icon: FaEnvelope},
        ],
    },
    {
        title: 'Operations',
        items: [
            {to: '/admin/recruiter-requests', label: 'Recruiter requests', icon: FaUserTie},
            {to: '/admin/company-join-requests', label: 'Company join requests', icon: FaHandshake},
        ],
    },
];

export default function AdminSidebar({isOpen, onClose}) {
    const getLinkClass = ({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`;

    return (
        <>
            <button
                type="button"
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
                aria-label="Close admin navigation"
                onClick={onClose}
            />
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.heading}>
                    <div>
                        <p>WorkHub</p>
                        <strong>Control Center</strong>
                    </div>
                    <button type="button" className={styles.closeButton} aria-label="Close admin navigation" onClick={onClose}>
                        <FaTimes/>
                    </button>
                </div>

                <div className={styles.adminBadge}>
                    <span>ADMIN</span>
                    <p>Workspace management</p>
                </div>

                <nav className={styles.navigation} aria-label="Admin navigation">
                    {sections.map((section) => (
                        <div className={styles.section} key={section.title}>
                            <p className={styles.sectionTitle}>{section.title}</p>
                            {section.items.map(({to, label, icon}) => (
                                <NavLink to={to} className={getLinkClass} onClick={onClose} key={to}>
                                    {createElement(icon, {className: styles.navIcon})}
                                    <span>{label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <NavLink to="/companies" className={styles.websiteLink} onClick={onClose}>
                    <FaExternalLinkAlt/>
                    <span>View public website</span>
                </NavLink>
            </aside>
        </>
    );
}
