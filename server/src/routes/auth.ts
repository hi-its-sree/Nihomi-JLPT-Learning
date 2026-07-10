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
  recoveryAnswers: z.array(z.string().trim().min(1)).length(5),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  answers: z.array(z.string().trim().min(1)).length(5),
  newPassword: z.string().min(8),
})

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

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

  const { email, password, username, recoveryAnswers } = parsed.data

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (existing) {
    const field = existing.email === email ? 'email' : 'username'
    return c.json({ error: `That ${field} is already taken` }, 409)
  }

  const hashed = await bcrypt.hash(password, 12)
  const hashedAnswers = await Promise.all(recoveryAnswers.map((answer) => bcrypt.hash(normalizeAnswer(answer), 12)))
  const user = await db.user.create({
    data: {
      email,
      username,
      password: hashed,
      ...(hashedAnswers[0] ? { recoveryAnswer1: hashedAnswers[0] } : {}),
      ...(hashedAnswers[1] ? { recoveryAnswer2: hashedAnswers[1] } : {}),
      ...(hashedAnswers[2] ? { recoveryAnswer3: hashedAnswers[2] } : {}),
      ...(hashedAnswers[3] ? { recoveryAnswer4: hashedAnswers[3] } : {}),
      ...(hashedAnswers[4] ? { recoveryAnswer5: hashedAnswers[4] } : {}),
    } as any,
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

// POST /auth/forgot-password
auth.post('/forgot-password', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Please provide all five answers and a new password' }, 400)
  }

  const { email, answers, newPassword } = parsed.data
  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return c.json({ error: 'No account was found for that email address' }, 404)
  }

  const storedAnswers = [
    (user as any).recoveryAnswer1,
    (user as any).recoveryAnswer2,
    (user as any).recoveryAnswer3,
    (user as any).recoveryAnswer4,
    (user as any).recoveryAnswer5,
  ]
  const hasAnswers = storedAnswers.every(Boolean)
  if (!hasAnswers) {
    return c.json({ error: 'This account has no recovery answers set yet' }, 400)
  }

  const allAnswersMatch = await Promise.all(
    storedAnswers.map((storedAnswer, index) => bcrypt.compare(normalizeAnswer(answers[index]), storedAnswer!)),
  )

  if (!allAnswersMatch.every(Boolean)) {
    return c.json({ error: 'One or more recovery answers are incorrect' }, 401)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await db.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  return c.json({ message: 'Password updated successfully' })
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
