import { Hono } from 'hono';
const router = new Hono();
const mockUsers = new Map();
const createUser = (email, username) => {
    const normalizedEmail = email.toLowerCase();
    const user = {
        id: `user_${Math.random().toString(36).slice(2, 10)}`,
        email: normalizedEmail,
        username: username || normalizedEmail.split('@')[0],
        role: 'learner',
    };
    mockUsers.set(normalizedEmail, user);
    return user;
};
router.get('/health', (c) => {
    return c.json({ status: 'ok', service: 'jlpt-learning-api' });
});
router.post('/api/v1/auth/register', async (c) => {
    const body = await c.req.json();
    const email = String(body?.email || '');
    const password = String(body?.password || '');
    const username = String(body?.username || '');
    if (!email || !password) {
        return c.json({ error: 'Email and password are required.' }, 400);
    }
    const user = createUser(email, username);
    return c.json({
        user,
        token: `mock-jwt-${user.id}`,
    });
});
router.post('/api/v1/auth/login', async (c) => {
    const body = await c.req.json();
    const email = String(body?.email || '');
    const password = String(body?.password || '');
    if (!email || !password) {
        return c.json({ error: 'Email and password are required.' }, 400);
    }
    const existingUser = mockUsers.get(email.toLowerCase()) || createUser(email);
    return c.json({
        user: existingUser,
        token: `mock-jwt-${existingUser.id}`,
    });
});
router.get('/api/v1/auth/me', (c) => {
    const authHeader = c.req.header('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const user = Array.from(mockUsers.values()).find((candidate) => `mock-jwt-${candidate.id}` === token);
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    return c.json({ user });
});
router.post('/api/v1/auth/logout', (c) => {
    return c.json({ success: true });
});
router.get('/api/v1/dashboard', (c) => {
    return c.json({
        message: 'Welcome to your JLPT learning dashboard',
        stats: {
            streak: 7,
            xp: 1250,
            readiness: 82,
            lessonsCompleted: 24,
        },
    });
});
router.get('/api/v1/levels', (c) => {
    return c.json({
        levels: [
            { code: 'N5', title: 'Beginner', color: 'from-emerald-400 to-teal-500' },
            { code: 'N4', title: 'Elementary', color: 'from-sky-400 to-blue-500' },
            { code: 'N3', title: 'Intermediate', color: 'from-violet-400 to-purple-500' },
            { code: 'N2', title: 'Upper Intermediate', color: 'from-amber-400 to-orange-500' },
            { code: 'N1', title: 'Advanced', color: 'from-rose-400 to-pink-500' },
        ],
    });
});
router.get('/api/v1/practice', (c) => {
    return c.json({
        items: [
            'Kanji tracing practice',
            'Vocabulary SRS review',
            'Grammar drills',
            'Listening shadowing',
        ],
    });
});
router.get('/api/v1/tests', (c) => {
    return c.json({
        modes: [
            'Timed mock test',
            'Section-based review',
            'Readiness analytics',
            'Pass probability estimate',
        ],
    });
});
export default router;
