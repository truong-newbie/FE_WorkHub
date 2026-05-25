import styles from './LoadingState.module.css';

export default function LoadingState({label = 'Loading...'}) {
    return (
        <div className={styles.loading} aria-live="polite">
            {label}
        </div>
    );
}

