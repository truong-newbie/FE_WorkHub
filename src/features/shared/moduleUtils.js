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
        page: Number(meta.pageNum ?? meta.page ?? meta.currentPage ?? 1),
        size: Number(meta.pageSize ?? meta.size ?? 10),
    };
}

export function cleanParams(params) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );
}

export function formatDate(value) {
    if (!value) {
        return 'Not available';
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Not available' : parsed.toLocaleString('en-US');
}

export function openDownload(fileUrl) {
    if (fileUrl) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
}
