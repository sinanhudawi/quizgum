import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'
import { readDb, writeDb } from './db'

const SESSION_COOKIE = 'quizgum_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>

export type CurrentUser = {
  id: string
  username: string
  fullName: string
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 64)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, keyHex] = stored.split(':')
  if (!saltHex || !keyHex) return false
  const key = await scryptAsync(password, Buffer.from(saltHex, 'hex'), 64)
  const expected = Buffer.from(keyHex, 'hex')
  return expected.length === key.length && timingSafeEqual(expected, key)
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url')
  const now = Date.now()
  await writeDb((db) => {
    db.sessions = db.sessions.filter((s) => s.expiresAt > now)
    db.sessions.push({
      tokenHash: hashToken(token),
      userId,
      expiresAt: now + SESSION_MAX_AGE * 1000,
    })
  })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    // The v0 preview runs inside a cross-site iframe and needs SameSite=None in development.
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    const tokenHash = hashToken(token)
    await writeDb((db) => {
      db.sessions = db.sessions.filter((s) => s.tokenHash !== tokenHash)
    })
  }
  cookieStore.delete(SESSION_COOKIE)
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const tokenHash = hashToken(token)
  return readDb((db) => {
    const session = db.sessions.find(
      (s) => s.tokenHash === tokenHash && s.expiresAt > Date.now(),
    )
    if (!session) return null
    const user = db.users.find((u) => u.id === session.userId)
    if (!user) return null
    return { id: user.id, username: user.username, fullName: user.fullName }
  })
})

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  return user
}
