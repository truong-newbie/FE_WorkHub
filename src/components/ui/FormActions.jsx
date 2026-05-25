import styles from './FormActions.module.css';

export default function FormActions({children}) {
    return <div className={styles.actions}>{children}</div>;
}

