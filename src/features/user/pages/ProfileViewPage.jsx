import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {FaUser, FaCamera, FaLock, FaEdit} from 'react-icons/fa';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getCurrentUserProfile} from '../services/userService.js';
import {useAuth} from '../../../stores/useAuth.js';
import styles from './ProfileViewPage.module.css';

function formatDate(value) {
    if (!value) {
        return 'Chưa cập nhật';
    }
    return new Date(value).toLocaleDateString('vi-VN');
}

export default function ProfileViewPage() {
    const {user: authUser, role, updateCurrentUser} = useAuth();
    const {showToast} = useToast();

    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const initials = useMemo(() => {
        const value = profile?.username || profile?.email || authUser?.username || 'U';
        return value.slice(0, 1).toUpperCase();
    }, [authUser?.username, profile]);

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getCurrentUserProfile();
            setProfile(data);
            updateCurrentUser(data);
        } catch (error) {
            const message = error.message || 'Không thể tải thông tin cá nhân';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsLoading(false);
        }
    }, [showToast, updateCurrentUser]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingState label="Đang tải thông tin cá nhân..."/>
            </div>
        );
    }

    if (!profile && errorMessage) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.errorContainer}>
                        <ErrorMessage message={errorMessage}/>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Thông tin cá nhân</h1>
                    <p>Xem và quản lý thông tin tài khoản của bạn</p>
                </div>

                <div className={styles.content}>
                    <aside className={styles.profileCard}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatar}>
                                {profile?.avatar ? (
                                    <img src={profile.avatar} alt="Avatar"/>
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className={styles.userName}>
                                {profile?.username || 'Chưa cập nhật'}
                            </div>
                            <div className={styles.userEmail}>
                                {profile?.email || 'Chưa cập nhật'}
                            </div>
                            <span className={styles.roleBadge}>
                                {profile?.roleName || role || 'USER'}
                            </span>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Tiêu đề</span>
                                <span className={`${styles.infoValue} ${!profile?.headline ? styles.infoValueEmpty : ''}`}>
                                    {profile?.headline || 'Chưa cập nhật'}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Số điện thoại</span>
                                <span className={`${styles.infoValue} ${!profile?.phone ? styles.infoValueEmpty : ''}`}>
                                    {profile?.phone || 'Chưa cập nhật'}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Địa điểm</span>
                                <span className={`${styles.infoValue} ${!profile?.location ? styles.infoValueEmpty : ''}`}>
                                    {profile?.location || 'Chưa cập nhật'}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Địa chỉ</span>
                                <span className={`${styles.infoValue} ${!profile?.address ? styles.infoValueEmpty : ''}`}>
                                    {profile?.address || 'Chưa cập nhật'}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Công ty</span>
                                <span className={`${styles.infoValue} ${!profile?.companyName ? styles.infoValueEmpty : ''}`}>
                                    {profile?.companyName || 'Chưa cập nhật'}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Số năm kinh nghiệm</span>
                                <span className={`${styles.infoValue} ${profile?.experienceYears === null || profile?.experienceYears === undefined ? styles.infoValueEmpty : ''}`}>
                                    {profile?.experienceYears !== null && profile?.experienceYears !== undefined
                                        ? `${profile.experienceYears} năm`
                                        : 'Chưa cập nhật'}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Ngày tạo tài khoản</span>
                                <span className={styles.infoValue}>
                                    {formatDate(profile?.createdDate)}
                                </span>
                            </div>
                        </div>
                    </aside>

                    <section className={styles.actionsPanel}>
                        <h2 className={styles.sectionTitle}>Quản lý tài khoản</h2>
                        <p className={styles.sectionDescription}>
                            Cập nhật thông tin cá nhân, ảnh đại diện và mật khẩu của bạn
                        </p>

                        <div className={styles.actionsList}>
                            <div className={styles.actionCard}>
                                <div className={styles.actionInfo}>
                                    <div className={styles.actionIcon}>
                                        <FaEdit/>
                                    </div>
                                    <div className={styles.actionText}>
                                        <div className={styles.actionTitle}>Chỉnh sửa hồ sơ</div>
                                        <div className={styles.actionDescription}>
                                            Cập nhật thông tin cá nhân, kinh nghiệm và liên hệ
                                        </div>
                                    </div>
                                </div>
                                <Link to="/profile/edit" className={styles.actionButton}>
                                    Chỉnh sửa
                                </Link>
                            </div>

                            <div className={styles.actionCard}>
                                <div className={styles.actionInfo}>
                                    <div className={styles.actionIcon}>
                                        <FaCamera/>
                                    </div>
                                    <div className={styles.actionText}>
                                        <div className={styles.actionTitle}>Đổi ảnh đại diện</div>
                                        <div className={styles.actionDescription}>
                                            Tải lên ảnh đại diện mới cho tài khoản của bạn
                                        </div>
                                    </div>
                                </div>
                                <Link to="/profile/avatar" className={styles.actionButton}>
                                    Thay đổi
                                </Link>
                            </div>

                            <div className={styles.actionCard}>
                                <div className={styles.actionInfo}>
                                    <div className={styles.actionIcon}>
                                        <FaLock/>
                                    </div>
                                    <div className={styles.actionText}>
                                        <div className={styles.actionTitle}>Đổi mật khẩu</div>
                                        <div className={styles.actionDescription}>
                                            Cập nhật mật khẩu để bảo mật tài khoản
                                        </div>
                                    </div>
                                </div>
                                <Link to="/profile/change-password" className={styles.actionButton}>
                                    Đổi mật khẩu
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
