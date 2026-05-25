import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import styles from './edit_profile.module.css';
import {getUserById, updateUser, uploadAvatar} from '../../../services/userApi.js';
import {useAuth} from '../../../stores/useAuth.js';
import {useToast} from '../../../components/ui/useToast.js';

function Edit_Profile() {
    const navigate = useNavigate();
    const {token} = useAuth();
    const {showToast} = useToast();

    const [userName, setUserName] = useState('');
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [connectLink, setConnectLink] = useState('');
    const [gender, setGender] = useState('');
    const [url, setUrl] = useState('');

    const getIdByToken = useCallback(() => {
        if (!token) {
            return null;
        }

        const decoded = jwtDecode(token);
        return decoded.id;
    }, [token]);

    const fetchUserByToken = useCallback(async () => {
        setUserName('');
        setFullName('');
        setBio('');
        setConnectLink('');
        setGender('');
        setUrl('');

        const idFromToken = getIdByToken();

        if (!idFromToken) {
            showToast({message: 'Token does not contain user id', type: 'error'});
            return null;
        }

        try {
            const userData = await getUserById(idFromToken);

            setUserName(userData.username || '');
            setFullName(userData.fullName || '');
            setBio(userData.bio || '');
            setConnectLink(userData.connectLink || '');
            setGender(userData.gender || '');
            setUrl(userData.avatar || '');

            return userData;
        } catch (error) {
            showToast({message: error.message || 'Failed to fetch user info', type: 'error'});
            return null;
        }
    }, [getIdByToken, showToast]);

    const updateInformation = async (e) => {
        e.preventDefault();

        const idFromToken = getIdByToken();

        if (!idFromToken) {
            showToast({message: 'Token does not contain user id', type: 'error'});
            return;
        }

        try {
            const userData = await updateUser({id: idFromToken, bio, connectLink, gender});

            setBio(userData.bio || bio);
            setConnectLink(userData.connectLink || connectLink);
            setGender(userData.gender || gender);
            showToast({message: 'Profile updated', type: 'success'});

            return userData;
        } catch (error) {
            showToast({message: error.message || 'Failed to update profile', type: 'error'});
            return null;
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const id = getIdByToken();

        if (!id) {
            showToast({message: 'Token does not contain user id', type: 'error'});
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', id);

        try {
            const data = await uploadAvatar(formData);
            setUrl(data.url || data);
            showToast({message: 'Avatar updated', type: 'success'});
        } catch (error) {
            showToast({message: error.message || 'Upload failed', type: 'error'});
        }
    };

    useEffect(() => {
        fetchUserByToken();
    }, [fetchUserByToken]);

    return (
        <div className={styles.edit_profile_body}>
            <form onSubmit={updateInformation}>
                <div className={styles.content}>
                    <p className={styles.nav}>Edit profile</p>
                    <div className={styles.infor}>
                        <div className={styles.infor_left}>
                            <img src={url || '/profile/edit_profile/avt.png'} alt="avatar"/>
                            <div>
                                <p className={styles.name}>{userName}</p>
                                <p className={styles.fullname}>{fullName}</p>
                            </div>
                        </div>
                        <div className={styles.infor_right}>
                            <label style={{display: 'inline-block', position: 'relative', overflow: 'hidden'}}>
                                <button type="button">Choose image</button>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        opacity: 0,
                                        width: '100%',
                                        height: '100%',
                                        cursor: 'pointer',
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                    <div className={styles.bio}>
                        <p>Bio</p>
                        <input
                            type="text"
                            placeholder="Bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>
                    <div className={styles.connect_link}>
                        <p>Connect Link</p>
                        <input
                            type="text"
                            placeholder="Link"
                            value={connectLink}
                            onChange={(e) => setConnectLink(e.target.value)}
                        />
                    </div>
                    <div className={styles.gender}>
                        <p className={styles.gender_header}>Gender</p>
                        <select
                            className={styles.gender_select}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                            <option value="OTHER">OTHER</option>
                        </select>
                        <p className={styles.des}>This won't be part of your public profile</p>
                    </div>
                    <div className={styles.submit}>
                        <button type="submit">Submit</button>
                        <button type="button" onClick={() => navigate('/profile')}>Back</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Edit_Profile;
