import styles from './Button.module.css';

export default function Button({type = 'button', variant = 'primary', className = '', children, ...props}) {
    return (
        <button type={type} className={`${styles.button} ${styles[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}

