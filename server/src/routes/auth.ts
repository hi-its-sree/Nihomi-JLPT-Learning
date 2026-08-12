import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../db'
import { signToken, verifyToken, signResetToken, verifyResetToken, fingerprintPassword } from '../lib/jwt'
import { requireAuth } from '../middleware/requireAuth'

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

const securityQuestionsSchema = z.object({
  answers: z.array(z.string().trim().min(1)).length(5),
})

const RECOVERY_ANSWERS_REQUIRED = 3

const verifyRecoverySchema = z.object({
  email: z.string().email(),
  answers: z.array(z.string()).length(5),
})

const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
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
    data: {
      email,
      username,
      password: hashed,
    },
    select: { id: true, email: true, username: true, xp: true, studyLevel: true, streakDays: true, createdAt: true },
  })

  // Brand new accounts never have recovery answers yet — that's set in a
  // follow-up step (POST /auth/security-questions) before onboarding.
  const token = signToken({ userId: user.id, email: user.email })
  return c.json({ user: { ...user, hasRecoveryAnswers: false }, token }, 201)
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
      hasRecoveryAnswers: Boolean((user as any).recoveryAnswer1),
    },
    token,
  })
})

// POST /auth/security-questions — save/replace the 5 recovery answers for the
// signed-in user. Called as its own step after signup, before onboarding.
auth.post('/security-questions', requireAuth, async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = securityQuestionsSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Please answer all five security questions' }, 400)
  }

  const userId = c.get('userId') as string
  const hashedAnswers = await Promise.all(
    parsed.data.answers.map((answer) => bcrypt.hash(normalizeAnswer(answer), 12)),
  )

  await db.user.update({
    where: { id: userId },
    data: {
      recoveryAnswer1: hashedAnswers[0],
      recoveryAnswer2: hashedAnswers[1],
      recoveryAnswer3: hashedAnswers[2],
      recoveryAnswer4: hashedAnswers[3],
      recoveryAnswer5: hashedAnswers[4],
    } as any,
  })

  return c.json({ message: 'Security questions saved', hasRecoveryAnswers: true })
})

// POST /auth/forgot-password/verify — step 1: confirm identity via any 3 of
// the 5 recovery answers, get back a short-lived token for step 2.
auth.post('/forgot-password/verify', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = verifyRecoverySchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Please provide your email and security answers' }, 400)
  }

  const { email, answers } = parsed.data
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

  const answered = answers
    .map((answer, index) => ({ index, answer: answer.trim() }))
    .filter(({ answer }) => answer.length > 0)

  if (answered.length !== RECOVERY_ANSWERS_REQUIRED) {
    return c.json({ error: `Please select exactly ${RECOVERY_ANSWERS_REQUIRED} of the 5 security questions` }, 400)
  }

  const matches = await Promise.all(
    answered.map(({ index, answer }) => bcrypt.compare(normalizeAnswer(answer), storedAnswers[index]!)),
  )

  if (!matches.every(Boolean)) {
    return c.json({ error: 'One or more security answers are incorrect' }, 401)
  }

  const resetToken = signResetToken({ userId: user.id, passwordFingerprint: fingerprintPassword(user.password) })
  return c.json({ resetToken })
})

// POST /auth/forgot-password/reset — step 2: spend the reset token to set a new password.
auth.post('/forgot-password/reset', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Please provide a new password of at least 8 characters' }, 400)
  }

  let payload: { userId: string; passwordFingerprint: string }
  try {
    payload = verifyResetToken(parsed.data.resetToken)
  } catch {
    return c.json({ error: 'This password reset session has expired. Please verify your security answers again.' }, 401)
  }

  const user = await db.user.findUnique({ where: { id: payload.userId } })
  if (!user || fingerprintPassword(user.password) !== payload.passwordFingerprint) {
    // Password already changed since this token was issued — token already used, or stale.
    return c.json({ error: 'This password reset session has expired. Please verify your security answers again.' }, 401)
  }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12)
  await db.user.update({
    where: { id: payload.userId },
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
    select: {
      id: true, email: true, username: true, xp: true, studyLevel: true, streakDays: true, lastStudied: true, createdAt: true,
      recoveryAnswer1: true,
    } as any,
  })

  if (!user) return c.json({ error: 'User not found' }, 404)
  const { recoveryAnswer1, ...publicUser } = user as any
  return c.json({ user: { ...publicUser, hasRecoveryAnswers: Boolean(recoveryAnswer1) } })
})

export default auth
