import styles from './Select.module.css';

export default function Select({label, error, id, className = '', children, ...props}) {
    const selectId = id || props.name;

    return (
        <label className={`${styles.field} ${className}`} htmlFor={selectId}>
            {label && <span className={styles.label}>{label}</span>}
            <select id={selectId} className={styles.select} {...props}>
                {children}
            </select>
            {error && <span className={styles.error}>{error}</span>}
        </label>
    );
}

