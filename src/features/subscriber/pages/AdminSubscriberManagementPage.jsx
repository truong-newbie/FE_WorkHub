import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import Table from '../../../components/ui/Table.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {cleanParams, formatDate, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import {deleteSubscriber, disableSubscriber, enableSubscriber, processSubscriberMailQueue, searchSubscribers, sendSubscriberMail} from '../services/subscriberService.js';
import styles from '../../shared/ModulePage.module.css';

export default function AdminSubscriberManagementPage() {
    const {showToast} = useToast();
    const [email, setEmail] = useState('');
    const [appliedEmail, setAppliedEmail] = useState('');
    const [enabled, setEnabled] = useState('');
    const [subscribers, setSubscribers] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [operationResult, setOperationResult] = useState(null);

    const loadSubscribers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await searchSubscribers(cleanParams({email: appliedEmail, enabled, page: page - 1, size: 10}));
            const items = getItems(data);
            setSubscribers(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load subscribers.');
        } finally {
            setIsLoading(false);
        }
    }, [appliedEmail, enabled, page]);

    useEffect(() => { loadSubscribers(); }, [loadSubscribers]);

    const handleStatus = async (subscriber, action) => {
        if ((action === 'delete' || action === 'disable') && !window.confirm(`${action} subscriber "${subscriber.email}"?`)) return;
        setIsSaving(true);
        try {
            if (action === 'enable') await enableSubscriber(subscriber.id);
            if (action === 'disable') await disableSubscriber(subscriber.id);
            if (action === 'delete') await deleteSubscriber(subscriber.id);
            showToast({message: `Subscriber ${action} action completed.`, type: 'success'});
            await loadSubscribers();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} subscriber.`, type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const runOperation = async (type) => {
        if (!window.confirm(type === 'send' ? 'Match jobs and queue subscriber emails?' : 'Process ready subscriber email queue items?')) return;
        setIsSaving(true);
        try {
            setOperationResult(type === 'send' ? await sendSubscriberMail() : await processSubscriberMailQueue());
            showToast({message: 'Subscriber mail operation started.', type: 'success'});
        } catch (error) {
            showToast({message: error.message || 'Unable to run subscriber mail operation.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {key: 'subscriber', header: 'Subscriber', render: (item) => <div><strong>{item.name || 'Unnamed subscriber'}</strong><p className={styles.muted}>{item.email}</p></div>},
        {key: 'skills', header: 'Skills', render: (item) => item.skills?.map((skill) => skill.name).join(', ') || 'N/A'},
        {key: 'status', header: 'Status', render: (item) => <span className={item.enabled ? styles.success_badge : styles.warning_badge}>{item.enabled ? 'Enabled' : 'Disabled'}</span>},
        {key: 'subscribed', header: 'Subscribed', render: (item) => formatDate(item.subscribedAt)},
        {key: 'actions', header: 'Actions', render: (item) => <div className={styles.actions}><Button variant="secondary" onClick={() => handleStatus(item, item.enabled ? 'disable' : 'enable')} disabled={isSaving}>{item.enabled ? 'Disable' : 'Enable'}</Button><Button variant="danger" onClick={() => handleStatus(item, 'delete')} disabled={isSaving}>Delete</Button></div>},
    ];

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.header}><div><p className={styles.eyebrow}>Subscriber administration</p><h1>Subscriber Management</h1><p>Manage job email subscriptions and queue matching operations.</p></div></header>
        <section className={styles.panel}><form className={styles.filters} onSubmit={(event) => {event.preventDefault(); setPage(1); setAppliedEmail(email.trim());}}><Input className={styles.grow} label="Email" name="subscriber-search" value={email} onChange={(event) => setEmail(event.target.value)}/><Select label="Status" name="subscriber-enabled" value={enabled} onChange={(event) => {setPage(1); setEnabled(event.target.value);}}><option value="">All</option><option value="true">Enabled</option><option value="false">Disabled</option></Select><Button type="submit">Search</Button></form></section>
        <section className={styles.panel}><div className={styles.panel_header}><div><h2>Mail operations</h2><p>Queue matching emails or republish ready queue items.</p></div></div><div className={styles.actions}><Button onClick={() => runOperation('send')} disabled={isSaving}>Match jobs and queue emails</Button><Button variant="secondary" onClick={() => runOperation('process')} disabled={isSaving}>Process ready queue</Button></div>{operationResult && <dl className={styles.details}>{Object.entries(operationResult).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>}</section>
        <section className={styles.panel}><ErrorMessage message={errorMessage}/>{isLoading ? <LoadingState label="Loading subscribers..."/> : <><Table columns={columns} rows={subscribers} getRowKey={(item) => item.id} emptyMessage="No subscribers found."/><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/></>}</section>
    </div></main>;
}
