import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../db'
import { signToken, verifyToken } from '../lib/jwt'

const auth = new Hono()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2).max(32).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /auth/register
auth.post('/register', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors[0].message }, 400)
  }

  const { email, password, username } = parsed.data

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (existing) {
    const field = existing.email === email ? 'email' : 'username'
    return c.json({ error: `That ${field} is already taken` }, 409)
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await db.user.create({
    data: { email, username, password: hashed },
    select: { id: true, email: true, username: true, xp: true, studyLevel: true, streakDays: true, createdAt: true },
  })

  const token = signToken({ userId: user.id, email: user.email })
  return c.json({ user, token }, 201)
})

// POST /auth/login
auth.post('/login', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid email or password' }, 400)
  }

  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const token = signToken({ userId: user.id, email: user.email })
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      xp: user.xp,
      studyLevel: user.studyLevel,
      streakDays: user.streakDays,
      createdAt: user.createdAt,
    },
    token,
  })
})

// GET /auth/me  — verify token and return current user
auth.get('/me', async (c) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  let payload: { userId: string; email: string }
  try {
    payload = verifyToken(header.slice(7))
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, username: true, xp: true, studyLevel: true, streakDays: true, lastStudied: true, createdAt: true },
  })

  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json({ user })
})

export default auth
