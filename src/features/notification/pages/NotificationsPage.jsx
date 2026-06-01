import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {cleanParams, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import NotificationItem from '../components/NotificationItem.jsx';
import {getNotifications} from '../services/notificationService.js';
import {useNotifications} from '../useNotifications.js';
import styles from '../components/Notification.module.css';
import {useNavigate} from 'react-router-dom';

const TYPES = ['JOB_APPLICATION_CREATED', 'JOB_APPLICATION_STATUS_UPDATED', 'ASSESSMENT_ASSIGNED', 'ASSESSMENT_SUBMITTED', 'COMPANY_APPROVED', 'COMPANY_REJECTED', 'ATS_SCREENING_COMPLETED', 'SYSTEM'];
const emptyFilters = {keyword: '', type: '', read: ''};

export default function NotificationsPage() {
    const navigate = useNavigate();
    const {showToast} = useToast();
    const {unreadCount, latestRealtimeId, markAsRead, markAllAsRead, removeNotification} = useNotifications();
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
    const [notifications, setNotifications] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const data = await getNotifications(cleanParams({...appliedFilters, pageNum: page, pageSize: 10, sortBy: 'createdAt', isAscending: false}));
            const items = getItems(data);
            setNotifications(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load notifications.');
        } finally {
            setIsLoading(false);
        }
    }, [appliedFilters, page]);

    useEffect(() => { load(); }, [latestRealtimeId, load]);

    const select = async (notification, route) => {
        try {
            if (!notification.read) await markAsRead(notification.id);
            if (route) navigate(route);
            else await load();
        } catch (error) {
            showToast({message: error.message || 'Unable to mark notification as read.', type: 'error'});
        }
    };

    const remove = async (notification) => {
        setBusyId(notification.id);
        try {
            await removeNotification(notification.id);
            showToast({message: 'Notification deleted.', type: 'success'});
            await load();
        } catch (error) {
            showToast({message: error.message || 'Unable to delete notification.', type: 'error'});
        } finally {
            setBusyId('');
        }
    };

    const markAll = async () => {
        try {
            await markAllAsRead();
            showToast({message: 'All notifications marked as read.', type: 'success'});
            await load();
        } catch (error) {
            showToast({message: error.message || 'Unable to mark all notifications as read.', type: 'error'});
        }
    };

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><h1>Notifications</h1><p>Review account activity, hiring updates and assessment events.</p></div>{unreadCount > 0 && <Button variant="secondary" onClick={markAll}>Mark all as read</Button>}</header>
        <section className={styles.panel}><form className={styles.filters} onSubmit={(event) => {event.preventDefault(); setPage(1); setAppliedFilters(filters);}}>
            <Input label="Keyword" name="notification-keyword" value={filters.keyword} onChange={(event) => setFilters({...filters, keyword: event.target.value})} placeholder="Search notifications"/>
            <Select label="Status" name="notification-read" value={filters.read} onChange={(event) => setFilters({...filters, read: event.target.value})}><option value="">All</option><option value="false">Unread</option><option value="true">Read</option></Select>
            <Select label="Type" name="notification-type" value={filters.type} onChange={(event) => setFilters({...filters, type: event.target.value})}><option value="">All types</option>{TYPES.map((type) => <option value={type} key={type}>{type}</option>)}</Select>
            <div className={styles.actions}><Button type="submit">Apply filters</Button><Button variant="secondary" onClick={() => {setFilters(emptyFilters); setAppliedFilters(emptyFilters); setPage(1);}}>Reset</Button></div>
        </form></section>
        <ErrorMessage message={errorMessage}/>
        {isLoading ? <LoadingState label="Loading notifications..."/> : notifications.length === 0 ? <div className={styles.panel}><p className={styles.empty}>No notifications match the current filters.</p></div> : <section className={styles.list}>{notifications.map((notification) => <NotificationItem notification={notification} busy={busyId === notification.id} onDelete={remove} onSelect={select} key={notification.id}/>)}</section>}
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
    </div></main>;
}
