import Button from './Button';
import styles from './Pagination.module.css';

export default function Pagination({page, totalPages, onPageChange}) {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    return (
        <nav className={styles.pagination} aria-label="Pagination">
            <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </Button>
            <span className={styles.status}>Page {page} of {totalPages}</span>
            <Button
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </nav>
    );
}

