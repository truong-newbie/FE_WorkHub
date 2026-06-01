import {useEffect, useRef, useState} from 'react';
import {FaBell} from 'react-icons/fa';
import {Link, useNavigate} from 'react-router-dom';
import {useToast} from '../../../components/ui/useToast.js';
import {useNotifications} from '../useNotifications.js';
import NotificationItem from './NotificationItem.jsx';
import styles from './Notification.module.css';

export default function NotificationBell() {
    const navigate = useNavigate();
    const {showToast} = useToast();
    const {recentNotifications, unreadCount, isLoading, isConnected, errorMessage, refreshRecentNotifications, markAsRead, markAllAsRead, removeNotification} = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [busyId, setBusyId] = useState('');
    const bellRef = useRef(null);

    useEffect(() => {
        const close = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const toggle = () => {
        setIsOpen((current) => !current);
        if (!isOpen) refreshRecentNotifications().catch(() => {});
    };

    const select = async (notification, route) => {
        try {
            if (!notification.read) await markAsRead(notification.id);
            setIsOpen(false);
            if (route) navigate(route);
        } catch (error) {
            showToast({message: error.message || 'Unable to mark notification as read.', type: 'error'});
        }
    };

    const remove = async (notification) => {
        setBusyId(notification.id);
        try {
            await removeNotification(notification.id);
        } catch (error) {
            showToast({message: error.message || 'Unable to delete notification.', type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    return <div className={styles.bellWrap} ref={bellRef}>
        <button className={styles.bellButton} type="button" aria-label="Notifications" onClick={toggle}>
            <FaBell/>
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
        {isOpen && <section className={styles.dropdown}>
            <header className={styles.dropdownHeader}><div><strong>Notifications</strong><span>{isConnected ? 'Realtime connected' : 'Syncing with server'}</span></div>{unreadCount > 0 && <button type="button" onClick={() => markAllAsRead().catch((error) => showToast({message: error.message || 'Unable to mark all notifications as read.', type: 'error'}))}>Mark all read</button>}</header>
            {errorMessage && <p className={styles.dropdownError}>{errorMessage}</p>}
            <div className={styles.dropdownList}>{isLoading ? <p className={styles.empty}>Loading notifications...</p> : recentNotifications.length === 0 ? <p className={styles.empty}>You do not have any notifications yet.</p> : recentNotifications.map((notification) => <NotificationItem compact notification={notification} busy={busyId === notification.id} onDelete={remove} onSelect={select} key={notification.id}/>)}</div>
            <Link className={styles.viewAll} to="/notifications" onClick={() => setIsOpen(false)}>View all notifications</Link>
        </section>}
    </div>;
}
