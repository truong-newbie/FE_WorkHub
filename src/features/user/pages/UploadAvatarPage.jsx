import {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FaCamera} from 'react-icons/fa';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getCurrentUserProfile, updateCurrentUserAvatar} from '../services/userService.js';
import {useAuth} from '../../../stores/useAuth.js';
import styles from './UploadAvatarPage.module.css';

export default function UploadAvatarPage() {
    const navigate = useNavigate();
    const {user: authUser, updateCurrentUser} = useAuth();
    const {showToast} = useToast();

    const [profile, setProfile] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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
        } catch (error) {
            const message = error.message || 'Không thể tải thông tin cá nhân';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => () => {
        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }
    }, [avatarPreviewUrl]);

    const handleAvatarFileChange = (event) => {
        const file = event.target.files?.[0];
        setErrorMessage('');

        if (!file) {
            setAvatarFile(null);
            setAvatarPreviewUrl('');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setAvatarFile(null);
            setAvatarPreviewUrl('');
            setErrorMessage('Vui lòng chọn file ảnh hợp lệ');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setAvatarFile(null);
            setAvatarPreviewUrl('');
            setErrorMessage('Kích thước file không được vượt quá 5MB');
            return;
        }

        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }

        setAvatarFile(file);
        setAvatarPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!avatarFile) {
            setErrorMessage('Vui lòng chọn ảnh đại diện');
            return;
        }

        setIsSaving(true);

        try {
            const updatedUser = await updateCurrentUserAvatar(avatarFile);
            setProfile((current) => ({...current, ...updatedUser}));
            setAvatarFile(null);
            setAvatarPreviewUrl('');
            updateCurrentUser(updatedUser);
            showToast({message: 'Cập nhật ảnh đại diện thành công', type: 'success'});
            navigate('/profile');
        } catch (error) {
            const message = error.message || 'Cập nhật ảnh đại diện thất bại';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <LoadingState label="Đang tải thông tin..."/>
                </div>
            </div>
        );
    }

    if (!profile && errorMessage) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.card}>
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
                    <h1>Đổi ảnh đại diện</h1>
                    <p>Tải lên ảnh đại diện mới cho tài khoản của bạn</p>
                </div>

                <div className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarPreview}>
                                {avatarPreviewUrl ? (
                                    <img src={avatarPreviewUrl} alt="Preview"/>
                                ) : profile?.avatar ? (
                                    <img src={profile.avatar} alt="Current avatar"/>
                                ) : (
                                    initials
                                )}
                            </div>

                            <div className={styles.uploadArea}>
                                <label className={styles.fileInputLabel}>
                                    <FaCamera className={styles.fileInputIcon}/>
                                    Chọn ảnh
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarFileChange}
                                    />
                                </label>

                                {avatarFile && (
                                    <div className={styles.fileName}>
                                        {avatarFile.name}
                                    </div>
                                )}

                                <div className={styles.helpText}>
                                    Chọn ảnh có định dạng JPG, PNG hoặc GIF.<br/>
                                    Kích thước tối đa: 5MB
                                </div>
                            </div>
                        </div>

                        {errorMessage && <ErrorMessage message={errorMessage}/>}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSaving || !avatarFile}
                            >
                                {isSaving ? 'Đang tải lên...' : 'Lưu ảnh đại diện'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
