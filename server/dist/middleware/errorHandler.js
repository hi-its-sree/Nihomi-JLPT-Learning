export const errorHandler = async (err, c) => {
    console.error('Unhandled error', err);
    if (err instanceof Error) {
        return c.json({ success: false, message: err.message }, 500);
    }
    return c.json({ success: false, message: 'Internal server error' }, 500);
};
