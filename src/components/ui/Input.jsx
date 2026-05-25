import styles from './Input.module.css';

export default function Input({label, error, id, className = '', ...props}) {
    const inputId = id || props.name;

    return (
        <label className={`${styles.field} ${className}`} htmlFor={inputId}>
            {label && <span className={styles.label}>{label}</span>}
            <input id={inputId} className={styles.input} {...props}/>
            {error && <span className={styles.error}>{error}</span>}
        </label>
    );
}

