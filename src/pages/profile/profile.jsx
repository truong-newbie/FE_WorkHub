import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import styles from './profile.module.css';
import {
    checkUserFollowing,
    followUser,
    getFollowList,
    getUserById,
    unfollowUser,
} from '../../services/userApi.js';
import {useAuth} from '../../stores/useAuth.js';
import {useToast} from '../../components/ui/useToast.js';

function Profile() {
    const navigate = useNavigate();
    const {idFromAnother} = useParams();
    const {token} = useAuth();
    const {showToast} = useToast();

    const [userName, setUserName] = useState('');
    const [bio, setBio] = useState('');
    const [connectLink, setConnectLink] = useState('');
    const [fullName, setFullName] = useState('');
    const [follower, setFollower] = useState(0);
    const [following, setFollowing] = useState(0);
    const [post, setPost] = useState(0);
    const [url, setUrl] = useState('');

    const [isYourProfile, setIsYourProfile] = useState(true);
    const [targetId, setTargetId] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [followList, setFollowList] = useState([]);
    const [modalTitle, setModalTitle] = useState('');

    const getIdByToken = useCallback(() => {
        if (!token) {
            return null;
        }

        const decoded = jwtDecode(token);
        return decoded.id;
    }, [token]);

    const resetProfile = useCallback(() => {
        setUserName('');
        setFullName('');
        setBio('');
        setConnectLink('');
        setUrl('');
        setFollower(0);
        setFollowing(0);
        setPost(0);
        setIsYourProfile(true);
    }, []);

    const fetchUserById = useCallback(async () => {
        resetProfile();

        const idFromToken = getIdByToken();

        if (!idFromToken) {
            showToast({message: 'Token does not contain user id', type: 'error'});
            return null;
        }

        const userId = idFromAnother || idFromToken;
        setIsYourProfile(!idFromAnother);

        try {
            const result = await getUserById(userId);

            setUserName(result.username || '');
            setFullName(result.fullName || '');
            setBio(result.bio || '');
            setConnectLink(result.connectLink || '');
            setUrl(result.avatar || '');
            setFollower(result.follower || 0);
            setFollowing(result.following || 0);
            setPost(result.post || 0);

            return result;
        } catch (error) {
            showToast({message: error.message || 'Failed to fetch user info', type: 'error'});
            return null;
        }
    }, [getIdByToken, idFromAnother, resetProfile, showToast]);

    const handleFollow = async () => {
        const myId = getIdByToken();

        try {
            const data = await followUser({myId, targetId});
            setIsFollowing(true);
            setFollower((prev) => prev + 1);
            return data;
        } catch (error) {
            showToast({message: error.message || 'Failed to follow user', type: 'error'});
            return null;
        }
    };

    const handleUnFollow = async () => {
        const myId = getIdByToken();

        try {
            const data = await unfollowUser({myId, targetId});
            setIsFollowing(false);
            setFollower((prev) => prev - 1);
            return data;
        } catch (error) {
            showToast({message: error.message || 'Failed to unfollow user', type: 'error'});
            return null;
        }
    };

    const checkFollowing = useCallback(async () => {
        const myId = getIdByToken();

        try {
            const result = await checkUserFollowing({myId, targetId});
            setIsFollowing(Boolean(result));
        } catch (error) {
            showToast({message: error.message || 'Failed to check following state', type: 'error'});
        }
    }, [getIdByToken, showToast, targetId]);

    const openFollowList = async (isFollower) => {
        const id = getIdByToken();
        const userId = idFromAnother || id;

        try {
            const list = await getFollowList({id: userId, isFollower});
            setFollowList(list || []);
            setModalTitle(isFollower ? 'Followers' : 'Followings');
            setShowModal(true);
        } catch (error) {
            showToast({message: error.message || 'Failed to fetch follow list', type: 'error'});
        }
    };

    useEffect(() => {
        if (idFromAnother) {
            setTargetId(idFromAnother);
            setIsYourProfile(false);
            setIsFollowing(false);
        } else {
            setIsYourProfile(true);
        }

        fetchUserById();
    }, [fetchUserById, idFromAnother]);

    useEffect(() => {
        if (!isYourProfile && targetId) {
            checkFollowing();
        }
    }, [checkFollowing, isYourProfile, targetId]);

    return (
        <div className={styles.profile_body}>
            <div className={styles.header}>
                <div className={styles.header_content}>
                    <div className={styles.avata}><img src={url || '/profile/logo.png'} alt=""/></div>
                    <div className={styles.information}>
                        <div className={styles.name_profile_edit}>
                            <p> {userName} </p>
                            {isYourProfile ? (
                                <button
                                    className={styles.edit}
                                    onClick={() => navigate('/edit_profile')}
                                    style={{cursor: 'pointer'}}
                                >
                                    Edit profile
                                </button>
                            ) : isFollowing ? (
                                <button
                                    className={styles.edit}
                                    onClick={handleUnFollow}
                                    style={{cursor: 'pointer'}}
                                >
                                    Unfollow
                                </button>
                            ) : (
                                <button
                                    className={styles.follow_btn}
                                    onClick={handleFollow}
                                    style={{cursor: 'pointer'}}
                                >
                                    Follow
                                </button>
                            )}
                            <img src="/profile/setting.png" alt=""/>
                        </div>
                        <div className={styles.follow}>
                            <p className={styles.post}>
                                <strong style={{fontSize: '1.1rem'}}>{post}</strong> posts
                            </p>
                            <p
                                className={styles.followers}
                                onClick={() => openFollowList(true)}
                                style={{cursor: 'pointer'}}
                            >
                                <strong style={{fontSize: '1.1rem'}}>{follower}</strong> followers
                            </p>
                            <p
                                className={styles.following}
                                onClick={() => openFollowList(false)}
                                style={{cursor: 'pointer'}}
                            >
                                <strong style={{fontSize: '1.1rem'}}>{following}</strong> followings
                            </p>
                        </div>
                        <p className={styles.profile_name}>{fullName}</p>
                        <p className={styles.description}>{bio}</p>
                        <p className={styles.link_connect}>
                            <a href={connectLink} target="_blank" rel="noopener noreferrer">{connectLink}</a>
                        </p>
                    </div>
                </div>
            </div>
            <div className={styles.story_mark}></div>
            <div className={styles.type_post}></div>
            <div className={styles.post}></div>

            {showModal && (
                <div className={styles.modal_overlay}>
                    <div className={styles.modal_content}>
                        <h3>{modalTitle}</h3>
                        <hr/>
                        <button onClick={() => setShowModal(false)}>Close</button>
                        <ul className={styles.list_user}>
                            {followList.map((user, index) => (
                                <li key={user.id || index}>
                                    <img src={user.avatar || '/profile/logo.png'} alt="" width={30} height={30}/>
                                    <div className={styles.follow_name}>
                                        <p className={styles.username}>{user.username}</p>
                                        <p className={styles.fullname}>{user.fullName}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
