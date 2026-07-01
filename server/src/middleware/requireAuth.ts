import type { Context, Next } from 'hono'
import { verifyToken } from '../lib/jwt'

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const token = header.slice(7)
    const payload = verifyToken(token)
    c.set('userId', payload.userId)
    c.set('userEmail', payload.email)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}
