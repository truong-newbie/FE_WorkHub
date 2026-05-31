import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import {unsubscribeSubscriber} from '../services/subscriberService.js';
import styles from '../../shared/ModulePage.module.css';

export default function UnsubscribePage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setErrorMessage('Unsubscribe token is missing.');
            return;
        }
        unsubscribeSubscriber(token).then(setResult).catch((error) => setErrorMessage(error.message || 'Unable to unsubscribe this email.'));
    }, [token]);

    return <main className={styles.page}><div className={styles.container}><section className={styles.hero}><p className={styles.eyebrow}>Email preferences</p><h1>Unsubscribe</h1>{!result && !errorMessage ? <LoadingState label="Updating email preferences..."/> : <><ErrorMessage message={errorMessage}/>{result && <p className={styles.muted}>{result.message || `${result.email} has been unsubscribed successfully.`}</p>}</>}</section></div></main>;
}
