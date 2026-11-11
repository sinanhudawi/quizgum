'use server'

import { redirect } from 'next/navigation'
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from '@/lib/auth'
import { newId, readDb, writeDb } from '@/lib/db'

export type AuthState = {
  error?: string
  fields?: Record<string, string>
}

const PHONE_RE = /^\+?[0-9][0-9\s-]{6,18}$/
const GMAIL_RE = /^[^\s@]+@gmail\.com$/i
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

function field(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = field(formData, 'fullName')
  const city = field(formData, 'city')
  const contact = field(formData, 'contact')
  const country = field(formData, 'country')
  const username = field(formData, 'username')
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const fields = { fullName, city, contact, country, username }

  if (fullName.length < 2 || fullName.length > 80)
    return { error: 'Please enter your full name.', fields }
  if (!city || city.length > 80) return { error: 'Please enter your city.', fields }
  if (!PHONE_RE.test(contact) && !GMAIL_RE.test(contact))
    return { error: 'Enter a valid phone number or Gmail address.', fields }
  if (!country || country.length > 80)
    return { error: 'Please enter your country.', fields }
  if (!USERNAME_RE.test(username))
    return {
      error: 'Username must be 3-20 characters: letters, numbers or underscores.',
      fields,
    }
  if (password.length < 6 || password.length > 128)
    return { error: 'Password must be at least 6 characters.', fields }
  if (password !== confirmPassword)
    return { error: 'Passwords do not match.', fields }

  const passwordHash = await hashPassword(password)
  const result = await writeDb((db) => {
    const taken = db.users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    )
    if (taken) return null
    const id = newId()
    db.users.push({
      id,
      fullName,
      city,
      contact,
      country,
      username,
      passwordHash,
      createdAt: Date.now(),
    })
    return id
  })

  if (!result) return { error: 'That username is already taken.', fields }

  await createSession(result)
  redirect('/home')
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = field(formData, 'username')
  const password = String(formData.get('password') ?? '')
  const fields = { username }

  if (!username || !password)
    return { error: 'Enter your username and password.', fields }

  const user = await readDb((db) =>
    db.users.find((u) => u.username.toLowerCase() === username.toLowerCase()),
  )
  const valid = user ? await verifyPassword(password, user.passwordHash) : false
  if (!user || !valid)
    return { error: 'Incorrect username or password.', fields }

  await createSession(user.id)
  redirect('/home')
}

export async function signOut() {
  await destroySession()
  redirect('/')
}
