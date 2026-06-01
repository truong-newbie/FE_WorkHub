import {FaTrashAlt} from 'react-icons/fa';
import {formatDate} from '../../shared/moduleUtils.js';
import {getNotificationRoute, getNotificationTypeLabel} from '../notificationRoutes.js';
import styles from './Notification.module.css';

export default function NotificationItem({notification, compact = false, busy = false, onDelete, onSelect}) {
    const route = getNotificationRoute(notification);

    return (
        <article className={`${styles.item} ${notification.read ? styles.read : styles.unread} ${compact ? styles.compact : ''}`}>
            <button className={styles.itemMain} type="button" onClick={() => onSelect(notification, route)}>
                <span className={styles.itemHeading}>
                    <strong>{notification.title}</strong>
                    {!notification.read && <i className={styles.unreadDot} aria-label="Unread"/>}
                </span>
                <span className={styles.typeLabel}>{getNotificationTypeLabel(notification.type)}</span>
                <span className={styles.content}>{notification.content}</span>
                <span className={styles.meta}>{formatDate(notification.createdAt)}{route ? ' | Open related page' : ''}</span>
            </button>
            {onDelete && <button className={styles.deleteButton} type="button" aria-label="Delete notification" title="Delete notification" disabled={busy} onClick={() => onDelete(notification)}><FaTrashAlt/></button>}
        </article>
    );
}
