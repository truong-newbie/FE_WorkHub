import {useState, useEffect, useRef} from 'react';
import {Link, NavLink, useNavigate} from 'react-router-dom';
import {
    FaUser,
    FaLock,
    FaSignOutAlt,
    FaChevronDown,
    FaBriefcase,
    FaBuilding,
    FaHeart,
    FaFileAlt,
    FaBars,
    FaTimes,
    FaUserTie,
} from 'react-icons/fa';
import {useAuth} from '../stores/useAuth.js';
import styles from './AppHeader.module.css';

export default function AppHeader({hideNavigation = false}) {
    const {user, role, roles, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const dropdownRef = useRef(null);

    const isCandidate = roles.includes('CANDIDATE');
    const isRecruiter = roles.includes('RECRUITER');
    const isAdmin = roles.includes('ADMIN');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/login');
    };

    const getInitials = () => {
        const name = user?.username || user?.email || 'U';
        return name.charAt(0).toUpperCase();
    };

    const renderPublicNav = () => (
        <>
            <NavLink
                to="/jobs"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Việc làm
            </NavLink>
            <NavLink
                to="/skills"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Skills
            </NavLink>
            <NavLink
                to="/companies"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Công ty
            </NavLink>
        </>
    );

    const renderCandidateNav = () => (
        <>
            <NavLink
                to="/jobs"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Việc làm
            </NavLink>
            <NavLink
                to="/candidate/resumes"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                CV
            </NavLink>
            <NavLink
                to="/applications"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Việc đã ứng tuyển
            </NavLink>
            <NavLink
                to="/candidate/become-recruiter"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Become a Recruiter
            </NavLink>
            <NavLink
                to="/saved-jobs"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Việc đã lưu
            </NavLink>
            <NavLink
                to="/candidate/jobs/recommended"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Gợi ý việc làm
            </NavLink>
            <NavLink
                to="/candidate/job-preference"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Job Preferences
            </NavLink>
            <NavLink
                to="/candidate/assessments"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                My Assessments
            </NavLink>
        </>
    );

    const renderRecruiterNav = () => (
        <>
            <NavLink
                to="/recruiter/dashboard"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Dashboard
            </NavLink>
            <NavLink
                to="/recruiter/jobs"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Tin tuyển dụng
            </NavLink>
            <NavLink
                to="/recruiter/assessments"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Assessments
            </NavLink>
            <NavLink
                to="/recruiter/company/requests"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Join requests
            </NavLink>
            <NavLink
                to="/recruiter/company"
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
                Công ty của tôi
            </NavLink>
        </>
    );

    const renderAdminNav = () => (
        <NavLink
            to="/admin/dashboard"
            className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
        >
            Admin Control Center
        </NavLink>
    );

    const renderMobileNav = () => {
        if (!showMobileMenu) return null;

        return (
            <div className={styles.mobileNav}>
                {!isAuthenticated && (
                    <>
                        <NavLink
                            to="/jobs"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Việc làm
                        </NavLink>
                        <NavLink
                            to="/skills"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Skills
                        </NavLink>
                        <NavLink
                            to="/companies"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Công ty
                        </NavLink>
                    </>
                )}
                {isCandidate && (
                    <>
                        <NavLink
                            to="/jobs"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Việc làm
                        </NavLink>
                        <NavLink
                            to="/candidate/resumes"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            CV
                        </NavLink>
                        <NavLink
                            to="/applications"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Việc đã ứng tuyển
                        </NavLink>
                        <NavLink
                            to="/candidate/become-recruiter"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Become a Recruiter
                        </NavLink>
                        <NavLink
                            to="/saved-jobs"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Việc đã lưu
                        </NavLink>
                        <NavLink
                            to="/candidate/jobs/recommended"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Gợi ý việc làm
                        </NavLink>
                        <NavLink
                            to="/candidate/job-preference"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Job Preferences
                        </NavLink>
                        <NavLink
                            to="/candidate/assessments"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            My Assessments
                        </NavLink>
                    </>
                )}
                {isRecruiter && (
                    <>
                        <NavLink
                            to="/recruiter/dashboard"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/recruiter/jobs"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Tin tuyển dụng
                        </NavLink>
                        <NavLink
                            to="/recruiter/assessments"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Assessments
                        </NavLink>
                        <NavLink
                            to="/recruiter/company/requests"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Join requests
                        </NavLink>
                        <NavLink
                            to="/recruiter/company"
                            className={({isActive}) =>
                                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                            }
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Công ty của tôi
                        </NavLink>
                    </>
                )}
                {isAdmin && (
                    <NavLink
                        to="/admin/dashboard"
                        className={({isActive}) =>
                            `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                        }
                        onClick={() => setShowMobileMenu(false)}
                    >
                        Admin Control Center
                    </NavLink>
                )}
            </div>
        );
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link to={isAuthenticated ? '/' : '/jobs'} className={styles.logo}>
                        <FaBriefcase />
                        WorkHub
                    </Link>

                    {!hideNavigation && (
                        <nav className={styles.nav}>
                            {!isAuthenticated && renderPublicNav()}
                            {isCandidate && renderCandidateNav()}
                            {isRecruiter && renderRecruiterNav()}
                            {isAdmin && renderAdminNav()}
                        </nav>
                    )}

                    <div className={styles.rightSection}>
                        {!isAuthenticated ? (
                            <div className={styles.authButtons}>
                                <button
                                    className={styles.loginButton}
                                    onClick={() => navigate('/login')}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    className={styles.registerButton}
                                    onClick={() => navigate('/register')}
                                >
                                    Đăng ký
                                </button>
                            </div>
                        ) : (
                            <div className={styles.userMenu} ref={dropdownRef}>
                                <button
                                    className={styles.userButton}
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <div className={styles.avatar}>
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Avatar" />
                                        ) : (
                                            getInitials()
                                        )}
                                    </div>
                                    <span className={styles.userName}>
                                        {user?.username || 'User'}
                                    </span>
                                    <FaChevronDown className={styles.dropdownIcon} />
                                </button>

                                {showDropdown && (
                                    <div className={styles.dropdown}>
                                        <div className={styles.dropdownHeader}>
                                            <div className={styles.dropdownUserName}>
                                                {user?.username || 'User'}
                                            </div>
                                            <div className={styles.dropdownUserEmail}>
                                                {user?.email || ''}
                                            </div>
                                            <span className={styles.dropdownRole}>
                                                {role || 'USER'}
                                            </span>
                                        </div>

                                        <div className={styles.dropdownDivider}></div>

                                        <Link
                                            to="/profile"
                                            className={styles.dropdownItem}
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <FaUser className={styles.dropdownItemIcon} />
                                            Thông tin cá nhân
                                        </Link>

                                        <Link
                                            to="/profile/edit"
                                            className={styles.dropdownItem}
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <FaFileAlt className={styles.dropdownItemIcon} />
                                            Chỉnh sửa hồ sơ
                                        </Link>

                                        <Link
                                            to="/profile/avatar"
                                            className={styles.dropdownItem}
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <FaUser className={styles.dropdownItemIcon} />
                                            Đổi ảnh đại diện
                                        </Link>

                                        <Link
                                            to="/profile/change-password"
                                            className={styles.dropdownItem}
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <FaLock className={styles.dropdownItemIcon} />
                                            Đổi mật khẩu
                                        </Link>

                                        <Link
                                            to="/settings/subscription"
                                            className={styles.dropdownItem}
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <FaFileAlt className={styles.dropdownItemIcon} />
                                            Job email subscription
                                        </Link>

                                        {isCandidate && (
                                            <Link
                                                to="/candidate/become-recruiter"
                                                className={styles.dropdownItem}
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <FaUserTie className={styles.dropdownItemIcon} />
                                                Become a Recruiter
                                            </Link>
                                        )}

                                        <div className={styles.dropdownDivider}></div>

                                        <button
                                            className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`}
                                            onClick={handleLogout}
                                        >
                                            <FaSignOutAlt className={styles.dropdownItemIcon} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {!hideNavigation && (
                            <button
                                className={styles.mobileMenuButton}
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                            >
                                {showMobileMenu ? <FaTimes /> : <FaBars />}
                            </button>
                        )}
                    </div>
                </div>
            </header>
            {!hideNavigation && renderMobileNav()}
        </>
    );
}
