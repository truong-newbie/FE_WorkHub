import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getCurrentUserProfile, updateCurrentUserProfile} from '../services/userService.js';
import {useAuth} from '../../../stores/useAuth.js';
import styles from './EditProfilePage.module.css';

const emptyProfileForm = {
    username: '',
    age: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
    headline: '',
    bio: '',
    experienceYears: '',
    location: '',
    website: '',
    linkedinUrl: '',
    githubUrl: '',
};

function normalizeProfileForm(user) {
    return {
        username: user?.username || '',
        age: user?.age ?? '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        dob: user?.dob || '',
        address: user?.address || '',
        headline: user?.headline || '',
        bio: user?.bio || '',
        experienceYears: user?.experienceYears ?? '',
        location: user?.location || '',
        website: user?.website || '',
        linkedinUrl: user?.linkedinUrl || '',
        githubUrl: user?.githubUrl || '',
    };
}

function validateProfileForm(form) {
    if (!form.username.trim()) {
        return 'Tên người dùng là bắt buộc';
    }

    if (form.age !== '' && Number(form.age) < 0) {
        return 'Tuổi phải là số dương';
    }

    if (form.experienceYears !== '' && Number(form.experienceYears) < 0) {
        return 'Số năm kinh nghiệm phải là số dương';
    }

    return '';
}

export default function EditProfilePage() {
    const navigate = useNavigate();
    const {updateCurrentUser} = useAuth();
    const {showToast} = useToast();

    const [profile, setProfile] = useState(null);
    const [profileForm, setProfileForm] = useState(emptyProfileForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getCurrentUserProfile();
            setProfile(data);
            setProfileForm(normalizeProfileForm(data));
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

    const updateProfileField = (field, value) => {
        setProfileForm((current) => ({...current, [field]: value}));
    };

    const buildProfilePayload = () => ({
        username: profileForm.username.trim(),
        age: profileForm.age === '' ? null : Number(profileForm.age),
        phone: profileForm.phone.trim() || null,
        gender: profileForm.gender || null,
        dob: profileForm.dob || null,
        address: profileForm.address.trim() || null,
        headline: profileForm.headline.trim() || null,
        bio: profileForm.bio.trim() || null,
        experienceYears: profileForm.experienceYears === '' ? null : Number(profileForm.experienceYears),
        location: profileForm.location.trim() || null,
        website: profileForm.website.trim() || null,
        linkedinUrl: profileForm.linkedinUrl.trim() || null,
        githubUrl: profileForm.githubUrl.trim() || null,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const validationError = validateProfileForm(profileForm);

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setIsSaving(true);

        try {
            const updatedUser = await updateCurrentUserProfile(buildProfilePayload());
            setProfile(updatedUser);
            setProfileForm(normalizeProfileForm(updatedUser));
            updateCurrentUser(updatedUser);
            showToast({message: 'Cập nhật thông tin thành công', type: 'success'});
            navigate('/profile');
        } catch (error) {
            const message = error.message || 'Cập nhật thông tin thất bại';
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
                    <h1>Chỉnh sửa hồ sơ</h1>
                    <p>Cập nhật thông tin cá nhân và kinh nghiệm của bạn</p>
                </div>

                <div className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label htmlFor="username" className={styles.label}>
                                    Tên người dùng *
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    className={styles.input}
                                    value={profileForm.username}
                                    onChange={(event) => updateProfileField('username', event.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="email" className={styles.label}>
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className={styles.input}
                                    value={profile?.email || ''}
                                    disabled
                                />
                                <span className={styles.helpText}>Email không thể thay đổi</span>
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="age" className={styles.label}>
                                    Tuổi
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    min="0"
                                    className={styles.input}
                                    value={profileForm.age}
                                    onChange={(event) => updateProfileField('age', event.target.value)}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="phone" className={styles.label}>
                                    Số điện thoại
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    className={styles.input}
                                    placeholder="0123456789"
                                    value={profileForm.phone}
                                    onChange={(event) => updateProfileField('phone', event.target.value)}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="gender" className={styles.label}>
                                    Giới tính
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    className={styles.select}
                                    value={profileForm.gender}
                                    onChange={(event) => updateProfileField('gender', event.target.value)}
                                >
                                    <option value="">Chưa chọn</option>
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="dob" className={styles.label}>
                                    Ngày sinh
                                </label>
                                <input
                                    id="dob"
                                    name="dob"
                                    type="date"
                                    className={styles.input}
                                    value={profileForm.dob}
                                    onChange={(event) => updateProfileField('dob', event.target.value)}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="experienceYears" className={styles.label}>
                                    Số năm kinh nghiệm
                                </label>
                                <input
                                    id="experienceYears"
                                    name="experienceYears"
                                    type="number"
                                    min="0"
                                    className={styles.input}
                                    value={profileForm.experienceYears}
                                    onChange={(event) => updateProfileField('experienceYears', event.target.value)}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="location" className={styles.label}>
                                    Địa điểm
                                </label>
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    className={styles.input}
                                    placeholder="Hà Nội, Việt Nam"
                                    value={profileForm.location}
                                    onChange={(event) => updateProfileField('location', event.target.value)}
                                />
                            </div>

                            <div className={`${styles.formField} ${styles.formFieldFull}`}>
                                <label htmlFor="headline" className={styles.label}>
                                    Tiêu đề
                                </label>
                                <input
                                    id="headline"
                                    name="headline"
                                    type="text"
                                    className={styles.input}
                                    placeholder="Senior Frontend Developer"
                                    value={profileForm.headline}
                                    onChange={(event) => updateProfileField('headline', event.target.value)}
                                />
                            </div>

                            <div className={`${styles.formField} ${styles.formFieldFull}`}>
                                <label htmlFor="address" className={styles.label}>
                                    Địa chỉ
                                </label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    className={styles.input}
                                    placeholder="123 Đường ABC, Quận XYZ"
                                    value={profileForm.address}
                                    onChange={(event) => updateProfileField('address', event.target.value)}
                                />
                            </div>

                            <div className={`${styles.formField} ${styles.formFieldFull}`}>
                                <label htmlFor="bio" className={styles.label}>
                                    Giới thiệu bản thân
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    className={styles.textarea}
                                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                                    value={profileForm.bio}
                                    onChange={(event) => updateProfileField('bio', event.target.value)}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="website" className={styles.label}>
                                    Website
                                </label>
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    className={styles.input}
                                    placeholder="https://yourwebsite.com"
                                    value={profileForm.website}
                                    onChange={(event) => updateProfileField('website', event.target.value)}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="linkedinUrl" className={styles.label}>
                                    LinkedIn URL
                                </label>
                                <input
                                    id="linkedinUrl"
                                    name="linkedinUrl"
                                    type="url"
                                    className={styles.input}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    value={profileForm.linkedinUrl}
                                    onChange={(event) => updateProfileField('linkedinUrl', event.target.value)}
                                />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="githubUrl" className={styles.label}>
                                    GitHub URL
                                </label>
                                <input
                                    id="githubUrl"
                                    name="githubUrl"
                                    type="url"
                                    className={styles.input}
                                    placeholder="https://github.com/yourusername"
                                    value={profileForm.githubUrl}
                                    onChange={(event) => updateProfileField('githubUrl', event.target.value)}
                                />
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
                                disabled={isSaving}
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
