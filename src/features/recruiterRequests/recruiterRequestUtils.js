export const requestStatusLabels = {
    PENDING: 'Pending review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

export function getRequestStatusLabel(status) {
    return requestStatusLabels[status] || status || 'Unknown';
}

export function formatRequestDate(value) {
    if (!value) {
        return 'Not available';
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Not available';
    }

    return parsedDate.toLocaleString('en-US');
}

export function getItems(data) {
    if (Array.isArray(data)) {
        return data;
    }

    return data?.items || data?.content || [];
}

export function getPaginationMeta(data, itemCount = 0) {
    const meta = data?.meta || {};

    return {
        total: Number(meta.total ?? meta.totalElements ?? itemCount),
        totalPages: Number(meta.totalPages || 1),
        page: Number(meta.page ?? meta.currentPage ?? 1),
        size: Number(meta.size ?? meta.pageSize ?? 10),
    };
}

export function cleanParams(params) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );
}
