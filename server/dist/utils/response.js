export const buildResponse = (message, data, pagination) => ({
    success: true,
    message,
    data,
    pagination: pagination ?? null,
});
export const buildPagination = (page, limit, total) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};
