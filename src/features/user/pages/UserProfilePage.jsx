import {useCallback, useEffect, useMemo, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Select from '../../../components/ui/Select.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {
    changeCurrentUserPassword,
    getCurrentUserProfile,
    updateCurrentUserAvatar,
    updateCurrentUserProfile,
} from '../services/userService.js';
import {useAuth} from '../../../stores/useAuth.js';
import styles from './UserProfilePage.module.css';

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

const emptyPasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

function formatDate(value) {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleDateString();
}

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
        return 'Username is required';
    }

    if (form.age !== '' && Number(form.age) < 0) {
        return 'Age must be a positive number';
    }

    if (form.experienceYears !== '' && Number(form.experienceYears) < 0) {
        return 'Experience years must be a positive number';
    }

    return '';
}

function validatePasswordForm(form) {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        return 'All password fields are required';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.newPassword)) {
        return 'New password must be at least 8 characters and include uppercase, lowercase, and number';
    }

    if (form.newPassword !== form.confirmPassword) {
        return 'Confirm password must match new password';
    }

    return '';
}

export default function UserProfilePage() {
    const {user: authUser, role, updateCurrentUser} = useAuth();
    const {showToast} = useToast();

    const [profile, setProfile] = useState(null);
    const [profileForm, setProfileForm] = useState(emptyProfileForm);
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [avatarError, setAvatarError] = useState('');

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
            setProfileForm(normalizeProfileForm(data));
            setAvatarFile(null);
            setAvatarPreviewUrl('');
            updateCurrentUser(data);
        } catch (error) {
            const message = error.message || 'Failed to load profile';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsLoading(false);
        }
    }, [showToast, updateCurrentUser]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => () => {
        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }
    }, [avatarPreviewUrl]);

    const updateProfileField = (field, value) => {
        setProfileForm((current) => ({...current, [field]: value}));
    };

    const updatePasswordField = (field, value) => {
        setPasswordForm((current) => ({...current, [field]: value}));
    };

    const handleAvatarFileChange = (event) => {
        const file = event.target.files?.[0];
        setAvatarError('');

        if (!file) {
            setAvatarFile(null);
            setAvatarPreviewUrl('');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setAvatarFile(null);
            setAvatarPreviewUrl('');
            setAvatarError('Avatar file must be an image');
            return;
        }

        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }

        setAvatarFile(file);
        setAvatarPreviewUrl(URL.createObjectURL(file));
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

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const validationError = validateProfileForm(profileForm);

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setIsSavingProfile(true);

        try {
            const updatedUser = await updateCurrentUserProfile(buildProfilePayload());
            setProfile(updatedUser);
            setProfileForm(normalizeProfileForm(updatedUser));
            updateCurrentUser(updatedUser);
            showToast({message: 'Profile updated successfully', type: 'success'});
        } catch (error) {
            const message = error.message || 'Failed to update profile';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAvatarSubmit = async (event) => {
        event.preventDefault();
        setAvatarError('');

        if (!avatarFile) {
            setAvatarError('Avatar image file is required');
            return;
        }

        setIsSavingAvatar(true);

        try {
            const updatedUser = await updateCurrentUserAvatar(avatarFile);
            setProfile((current) => ({...current, ...updatedUser}));
            setAvatarFile(null);
            setAvatarPreviewUrl('');
            updateCurrentUser(updatedUser);
            showToast({message: 'Avatar updated successfully', type: 'success'});
        } catch (error) {
            const message = error.message || 'Failed to update avatar';
            setAvatarError(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSavingAvatar(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setPasswordError('');

        const validationError = validatePasswordForm(passwordForm);

        if (validationError) {
            setPasswordError(validationError);
            return;
        }

        setIsChangingPassword(true);

        try {
            const message = await changeCurrentUserPassword(passwordForm);
            setPasswordForm(emptyPasswordForm);
            showToast({
                message: typeof message === 'string' ? message : 'Password changed successfully',
                type: 'success',
            });
        } catch (error) {
            const message = error.message || 'Failed to change password';
            setPasswordError(message);
            showToast({message, type: 'error'});
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return <LoadingState label="Loading profile..."/>;
    }

    if (!profile && errorMessage) {
        return (
            <main className={styles.page}>
                <div className={styles.shell}>
                    <section className={styles.panel}>
                        <ErrorMessage message={errorMessage}/>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <aside className={styles.panel}>
                    {profile ? (
                        <>
                            <div className={styles.summary}>
                                {profile.avatar ? (
                                    <img className={styles.avatar} src={profile.avatar} alt="Avatar"/>
                                ) : (
                                    <div className={styles.avatar}>{initials}</div>
                                )}
                                <h1>{profile.username || 'Unnamed user'}</h1>
                                <p>{profile.email || 'No email'}</p>
                                <span className={styles.role}>{profile.roleName || role || 'USER'}</span>
                            </div>
                            <div className={styles.metaList}>
                                <div className={styles.metaItem}>
                                    <span>Headline</span>
                                    <strong>{profile.headline || 'Not set'}</strong>
                                </div>
                                <div className={styles.metaItem}>
                                    <span>Phone</span>
                                    <strong>{profile.phone || 'Not set'}</strong>
                                </div>
                                <div className={styles.metaItem}>
                                    <span>Location</span>
                                    <strong>{profile.location || 'Not set'}</strong>
                                </div>
                                <div className={styles.metaItem}>
                                    <span>Address</span>
                                    <strong>{profile.address || 'Not set'}</strong>
                                </div>
                                <div className={styles.metaItem}>
                                    <span>Company</span>
                                    <strong>{profile.companyName || 'Not set'}</strong>
                                </div>
                                <div className={styles.metaItem}>
                                    <span>Created</span>
                                    <strong>{formatDate(profile.createdDate)}</strong>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className={styles.empty}>No profile data.</p>
                    )}
                </aside>

                <section className={`${styles.panel} ${styles.formPanel}`}>
                    <div className={styles.sectionHeader}>
                        <h2>Profile Settings</h2>
                        <p>Update the fields supported by `/user/me/profile`.</p>
                    </div>
                    <form className={styles.formPanel} onSubmit={handleProfileSubmit}>
                        <div className={styles.formGrid}>
                            <Input
                                label="Username"
                                name="username"
                                value={profileForm.username}
                                onChange={(event) => updateProfileField('username', event.target.value)}
                                required
                            />
                            <Input label="Email" name="email" value={profile?.email || ''} disabled/>
                            <Input
                                label="Age"
                                name="age"
                                type="number"
                                min="0"
                                value={profileForm.age}
                                onChange={(event) => updateProfileField('age', event.target.value)}
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={profileForm.phone}
                                onChange={(event) => updateProfileField('phone', event.target.value)}
                            />
                            <Select
                                label="Gender"
                                name="gender"
                                value={profileForm.gender}
                                onChange={(event) => updateProfileField('gender', event.target.value)}
                            >
                                <option value="">Not set</option>
                                <option value="MALE">MALE</option>
                                <option value="FEMALE">FEMALE</option>
                                <option value="OTHER">OTHER</option>
                            </Select>
                            <Input
                                label="Date of birth"
                                name="dob"
                                type="date"
                                value={profileForm.dob}
                                onChange={(event) => updateProfileField('dob', event.target.value)}
                            />
                            <Input
                                label="Headline"
                                name="headline"
                                value={profileForm.headline}
                                onChange={(event) => updateProfileField('headline', event.target.value)}
                            />
                            <Input
                                label="Experience years"
                                name="experienceYears"
                                type="number"
                                min="0"
                                value={profileForm.experienceYears}
                                onChange={(event) => updateProfileField('experienceYears', event.target.value)}
                            />
                            <Input
                                label="Location"
                                name="location"
                                value={profileForm.location}
                                onChange={(event) => updateProfileField('location', event.target.value)}
                            />
                            <Input
                                label="Website"
                                name="website"
                                value={profileForm.website}
                                onChange={(event) => updateProfileField('website', event.target.value)}
                            />
                            <Input
                                label="LinkedIn URL"
                                name="linkedinUrl"
                                value={profileForm.linkedinUrl}
                                onChange={(event) => updateProfileField('linkedinUrl', event.target.value)}
                            />
                            <Input
                                label="GitHub URL"
                                name="githubUrl"
                                value={profileForm.githubUrl}
                                onChange={(event) => updateProfileField('githubUrl', event.target.value)}
                            />
                            <Input
                                className={styles.fullRow}
                                label="Address"
                                name="address"
                                value={profileForm.address}
                                onChange={(event) => updateProfileField('address', event.target.value)}
                            />
                            <label className={`${styles.textareaField} ${styles.fullRow}`} htmlFor="bio">
                                <span>Bio</span>
                                <textarea
                                    id="bio"
                                    className={styles.textarea}
                                    value={profileForm.bio}
                                    onChange={(event) => updateProfileField('bio', event.target.value)}
                                />
                            </label>
                        </div>
                        <ErrorMessage message={errorMessage}/>
                        <div className={styles.actions}>
                            <Button type="button" variant="secondary" onClick={loadProfile} disabled={isSavingProfile}>
                                Reset
                            </Button>
                            <Button type="submit" disabled={isSavingProfile}>
                                {isSavingProfile ? 'Saving...' : 'Save profile'}
                            </Button>
                        </div>
                    </form>

                    <div className={styles.sectionHeader}>
                        <h2>Avatar</h2>
                        <p>Upload an image file through `/user/me/avatar`.</p>
                    </div>
                    <form className={styles.formPanel} onSubmit={handleAvatarSubmit}>
                        <div className={styles.avatarUpload}>
                            {avatarPreviewUrl ? (
                                <img className={styles.avatarPreview} src={avatarPreviewUrl} alt="Avatar preview"/>
                            ) : profile?.avatar ? (
                                <img className={styles.avatarPreview} src={profile.avatar} alt="Current avatar"/>
                            ) : (
                                <div className={styles.avatar}>{initials}</div>
                            )}
                            <label className={styles.fileInput} htmlFor="avatar">
                                <span>Choose avatar image</span>
                                <input
                                    id="avatar"
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarFileChange}
                                />
                            </label>
                        </div>
                        <ErrorMessage message={avatarError}/>
                        <div className={styles.actions}>
                            <Button type="submit" disabled={isSavingAvatar}>
                                {isSavingAvatar ? 'Saving avatar...' : 'Save avatar'}
                            </Button>
                        </div>
                    </form>

                    <div className={styles.sectionHeader}>
                        <h2>Change Password</h2>
                        <p>Use your current password before setting a new one.</p>
                    </div>
                    <form className={styles.formPanel} onSubmit={handlePasswordSubmit}>
                        <div className={styles.formGrid}>
                            <Input
                                label="Current password"
                                name="currentPassword"
                                type="password"
                                autoComplete="current-password"
                                value={passwordForm.currentPassword}
                                onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
                            />
                            <Input
                                label="New password"
                                name="newPassword"
                                type="password"
                                autoComplete="new-password"
                                value={passwordForm.newPassword}
                                onChange={(event) => updatePasswordField('newPassword', event.target.value)}
                            />
                            <Input
                                label="Confirm password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={passwordForm.confirmPassword}
                                onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
                            />
                        </div>
                        <ErrorMessage message={passwordError}/>
                        <div className={styles.actions}>
                            <Button type="submit" disabled={isChangingPassword}>
                                {isChangingPassword ? 'Changing...' : 'Change password'}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
