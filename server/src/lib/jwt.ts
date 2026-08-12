import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const SECRET = process.env.JWT_SECRET || 'fallback-dev-secret'
const RESET_TOKEN_PURPOSE = 'password-reset'

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' })
}

// A login session token always carries `email` and never `purpose` — reject
// anything else (e.g. a password-reset token) so it can't be used as a
// session token to reach authenticated routes.
export function verifyToken(token: string): { userId: string; email: string } {
  const decoded = jwt.verify(token, SECRET) as { userId: string; email?: string; purpose?: string }
  if (decoded.purpose || !decoded.email) {
    throw new Error('Not a session token')
  }
  return { userId: decoded.userId, email: decoded.email }
}

// Fingerprint of the user's current password hash, embedded in the reset
// token so it can only be spent once: resetting the password changes the
// hash, which invalidates any already-issued token for the same fingerprint.
export function fingerprintPassword(passwordHash: string): string {
  return crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 16)
}

// Short-lived token proving the user already answered their security
// questions — scoped to password reset only, distinct from a login session.
export function signResetToken(payload: { userId: string; passwordFingerprint: string }): string {
  return jwt.sign({ userId: payload.userId, pwfp: payload.passwordFingerprint, purpose: RESET_TOKEN_PURPOSE }, SECRET, { expiresIn: '10m' })
}

export function verifyResetToken(token: string): { userId: string; passwordFingerprint: string } {
  const decoded = jwt.verify(token, SECRET) as { userId: string; pwfp?: string; purpose?: string }
  if (decoded.purpose !== RESET_TOKEN_PURPOSE || !decoded.pwfp) {
    throw new Error('Invalid token purpose')
  }
  return { userId: decoded.userId, passwordFingerprint: decoded.pwfp }
}
