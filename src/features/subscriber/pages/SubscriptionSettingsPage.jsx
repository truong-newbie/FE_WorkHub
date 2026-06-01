import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import SkillSelector from '../../skill/components/SkillSelector.jsx';
import {formatDate} from '../../shared/moduleUtils.js';
import {createSubscriber, deleteSubscriber, disableSubscriber, enableSubscriber, getMySubscriber, updateSubscriber} from '../services/subscriberService.js';
import styles from '../../shared/ModulePage.module.css';

const emptyForm = {name: '', email: '', skillIds: [], enabled: true};

export default function SubscriptionSettingsPage() {
    const {showToast} = useToast();
    const [subscriber, setSubscriber] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadSubscriber = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const data = await getMySubscriber();
            setSubscriber(data);
            setForm({name: data.name || '', email: data.email || '', skillIds: data.skills?.map((skill) => Number(skill.id)) || [], enabled: data.enabled !== false});
        } catch (error) {
            if (error.status === 404) {
                setSubscriber(null);
                setForm(emptyForm);
            } else {
                setErrorMessage(error.message || 'Unable to load subscription settings.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadSubscriber(); }, [loadSubscriber]);

    const updateField = (field, value) => setForm((current) => ({...current, [field]: value}));

    const handleSave = async (event) => {
        event.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setErrorMessage('Enter a valid subscription email.');
            return;
        }
        if (form.skillIds.length === 0) {
            setErrorMessage('Choose at least one skill for job email matching.');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {...form, email: form.email.trim(), name: form.name.trim() || undefined};
            if (subscriber) await updateSubscriber(subscriber.id, payload); else await createSubscriber(payload);
            showToast({message: subscriber ? 'Subscription updated.' : 'Job email subscription created.', type: 'success'});
            await loadSubscriber();
        } catch (error) {
            showToast({message: error.message || 'Unable to save subscription.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatus = async (action) => {
        if (!subscriber || ((action === 'delete' || action === 'disable') && !window.confirm(`${action} this subscription?`))) return;
        setIsSaving(true);
        try {
            if (action === 'enable') await enableSubscriber(subscriber.id);
            if (action === 'disable') await disableSubscriber(subscriber.id);
            if (action === 'delete') await deleteSubscriber(subscriber.id);
            showToast({message: `Subscription ${action} action completed.`, type: 'success'});
            await loadSubscriber();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} subscription.`, type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingState label="Loading subscription settings..."/>;

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.header}><div><p className={styles.eyebrow}>Job email alerts</p><h1>Subscription Settings</h1><p>Receive relevant WorkHub job opportunities based on your skills.</p></div></header>
        <ErrorMessage message={errorMessage}/>
        <div className={styles.grid}>
            <section className={styles.panel}>
                <div className={styles.panel_header}><div><h2>{subscriber ? 'Update subscription' : 'Create subscription'}</h2><p>Choose skills that match the roles you want to receive.</p></div></div>
                <form className={styles.stack} onSubmit={handleSave}>
                    <Input label="Name" name="subscriber-name" value={form.name} onChange={(event) => updateField('name', event.target.value)}/>
                    <Input label="Email" name="subscriber-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required/>
                    <SkillSelector value={form.skillIds} onChange={(skillIds) => updateField('skillIds', skillIds)}/>
                    <label className={styles.checkbox}><input type="checkbox" checked={form.enabled} onChange={(event) => updateField('enabled', event.target.checked)}/>Enable job email notifications</label>
                    <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : subscriber ? 'Update subscription' : 'Create subscription'}</Button>
                </form>
            </section>
            <section className={styles.panel}>
                <div className={styles.panel_header}><div><h2>Current status</h2></div></div>
                {subscriber ? <>
                    <dl className={styles.details}><div><dt>Email</dt><dd>{subscriber.email}</dd></div><div><dt>Status</dt><dd><span className={subscriber.enabled ? styles.success_badge : styles.warning_badge}>{subscriber.enabled ? 'Enabled' : 'Disabled'}</span></dd></div><div><dt>Subscribed</dt><dd>{formatDate(subscriber.subscribedAt)}</dd></div><div><dt>Last email sent</dt><dd>{formatDate(subscriber.lastEmailSentAt)}</dd></div></dl>
                    <div className={styles.actions}><Button variant="secondary" onClick={() => handleStatus(subscriber.enabled ? 'disable' : 'enable')} disabled={isSaving}>{subscriber.enabled ? 'Disable emails' : 'Enable emails'}</Button><Button variant="danger" onClick={() => handleStatus('delete')} disabled={isSaving}>Delete subscription</Button></div>
                </> : <div className={styles.empty}>You do not have a job email subscription yet.</div>}
            </section>
        </div>
    </div></main>;
}
