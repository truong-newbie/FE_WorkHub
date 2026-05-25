import {useCallback, useMemo, useState} from 'react';
import {ToastContext} from './toastContext.js';
import styles from './ToastProvider.module.css';

export function ToastProvider({children}) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(({message, type = 'info', duration = 4000}) => {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, {id, message, type}]);

        if (duration > 0) {
            window.setTimeout(() => removeToast(id), duration);
        }

        return id;
    }, [removeToast]);

    const value = useMemo(() => ({showToast, removeToast}), [showToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className={styles.region} aria-live="polite" aria-label="Notifications">
                {toasts.map((toast) => (
                    <button
                        key={toast.id}
                        type="button"
                        className={`${styles.toast} ${styles[toast.type]}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        {toast.message}
                    </button>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
