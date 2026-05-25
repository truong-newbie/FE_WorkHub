import styles from './Table.module.css';

export default function Table({columns, rows, getRowKey, emptyMessage = 'No data'}) {
    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key}>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.empty}>{emptyMessage}</td>
                        </tr>
                    ) : rows.map((row, index) => (
                        <tr key={getRowKey ? getRowKey(row) : index}>
                            {columns.map((column) => (
                                <td key={column.key}>
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

