import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export type QuestionType = 'single' | 'multiple'

export type User = {
  id: string
  fullName: string
  city: string
  contact: string
  country: string
  username: string
  passwordHash: string
  createdAt: number
}

export type Session = {
  tokenHash: string
  userId: string
  expiresAt: number
}

export type Question = {
  id: string
  text: string
  type: QuestionType
  options: string[]
  correct: number[]
}

export type Quiz = {
  id: string
  code: string
  title: string
  creatorId: string
  creatorName: string
  isPublic: boolean
  questions: Question[]
  createdAt: number
}

export type Attempt = {
  id: string
  quizCode: string
  userId: string
  username: string
  score: number
  total: number
  durationMs: number
  createdAt: number
}

export type Database = {
  users: User[]
  sessions: Session[]
  quizzes: Quiz[]
  attempts: Attempt[]
  usedCodes: string[]
}

// Local JSON storage. On Vercel only /tmp is writable, so data there is ephemeral.
const DATA_DIR = process.env.VERCEL
  ? '/tmp/quizgum'
  : path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'quizgum.json')

const store = globalThis as unknown as {
  __quizgumDb?: Database
  __quizgumLock?: Promise<unknown>
}

function q(
  text: string,
  options: string[],
  correct: number[],
  type: QuestionType = 'single',
): Question {
  return { id: randomUUID(), text, type, options, correct }
}

function seed(): Database {
  const now = Date.now()
  const quizzes: Quiz[] = [
    {
      id: randomUUID(),
      code: '100001',
      title: 'World Capitals Warm-up',
      creatorId: 'quizgum',
      creatorName: 'quizgum',
      isPublic: true,
      createdAt: now,
      questions: [
        q('What is the capital of Japan?', ['Osaka', 'Tokyo', 'Kyoto', 'Nagoya'], [1]),
        q('What is the capital of Australia?', ['Sydney', 'Melbourne', 'Canberra', 'Perth'], [2]),
        q('What is the capital of Canada?', ['Toronto', 'Ottawa', 'Vancouver', 'Montreal'], [1]),
        q(
          'Which of these cities are capitals?',
          ['Paris', 'Istanbul', 'Nairobi', 'Rio de Janeiro'],
          [0, 2],
          'multiple',
        ),
      ],
    },
    {
      id: randomUUID(),
      code: '100002',
      title: 'Science Snack',
      creatorId: 'quizgum',
      creatorName: 'quizgum',
      isPublic: true,
      createdAt: now,
      questions: [
        q('Which planet is known as the Red Planet?', ['Venus', 'Mars', 'Jupiter', 'Mercury'], [1]),
        q('What gas do plants absorb from the air?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], [2]),
        q(
          'Which of these are mammals?',
          ['Dolphin', 'Shark', 'Bat', 'Penguin'],
          [0, 2],
          'multiple',
        ),
        q('What is H2O commonly called?', ['Salt', 'Water', 'Hydrogen', 'Ice cream'], [1]),
      ],
    },
  ]
  return {
    users: [],
    sessions: [],
    quizzes,
    attempts: [],
    usedCodes: quizzes.map((quiz) => quiz.code),
  }
}

async function persist(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const tmp = `${DATA_FILE}.${process.pid}.tmp`
  await fs.writeFile(tmp, JSON.stringify(db))
  await fs.rename(tmp, DATA_FILE)
}

async function load(): Promise<Database> {
  if (store.__quizgumDb) return store.__quizgumDb
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    store.__quizgumDb = JSON.parse(raw) as Database
  } catch {
    store.__quizgumDb = seed()
    await persist(store.__quizgumDb)
  }
  return store.__quizgumDb
}

export async function readDb<T>(fn: (db: Readonly<Database>) => T): Promise<T> {
  await store.__quizgumLock
  const db = await load()
  return fn(db)
}

export async function writeDb<T>(fn: (db: Database) => T): Promise<T> {
  const run = (store.__quizgumLock ?? Promise.resolve()).then(async () => {
    const db = await load()
    const result = fn(db)
    await persist(db)
    return result
  })
  store.__quizgumLock = run.catch(() => undefined)
  return run
}

export function newId() {
  return randomUUID()
}
