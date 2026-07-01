import { Hono } from 'hono'

const router = new Hono()

router.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'jlpt-learning-api' })
})

router.get('/api/v1/dashboard', (c) => {
  return c.json({
    message: 'Welcome to your JLPT learning dashboard',
    stats: {
      streak: 7,
      xp: 1250,
      readiness: 82,
      lessonsCompleted: 24,
    },
  })
})

router.get('/api/v1/levels', (c) => {
  return c.json({
    levels: [
      { code: 'N5', title: 'Beginner', color: 'from-emerald-400 to-teal-500' },
      { code: 'N4', title: 'Elementary', color: 'from-sky-400 to-blue-500' },
      { code: 'N3', title: 'Intermediate', color: 'from-violet-400 to-purple-500' },
      { code: 'N2', title: 'Upper Intermediate', color: 'from-amber-400 to-orange-500' },
      { code: 'N1', title: 'Advanced', color: 'from-rose-400 to-pink-500' },
    ],
  })
})

router.get('/api/v1/auth/me', (c) => {
  return c.json({ user: { id: 'demo-user', username: 'student', email: 'student@example.com' } })
})

router.post('/api/v1/auth/login', async (c) => {
  const body = await c.req.json()
  return c.json({ user: { id: 'demo-user', username: 'student', email: body.email }, token: 'demo-token' })
})

router.post('/api/v1/auth/register', async (c) => {
  const body = await c.req.json()
  return c.json({ user: { id: 'demo-user', username: body.username, email: body.email }, token: 'demo-token' })
})

router.get('/api/v1/lessons', (c) => {
  return c.json({ lessons: [{ id: 1, title: 'Greetings and self-introduction', level: 'N5' }, { id: 2, title: 'Daily routines', level: 'N5' }] })
})

router.get('/api/v1/flashcards', (c) => {
  return c.json({ cards: [{ front: 'こんにちは', back: 'Hello' }, { front: 'ありがとう', back: 'Thank you' }] })
})

export default router
