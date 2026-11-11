'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { newId, readDb, writeDb, type QuestionType } from '@/lib/db'
import { isCorrect } from '@/lib/quiz'

export type QuizDraft = {
  title: string
  isPublic: boolean
  code: string
  questions: {
    text: string
    type: QuestionType
    options: string[]
    correct: number[]
  }[]
}

export type CreateQuizResult =
  | { ok: true; code: string }
  | { ok: false; error: string }

const CODE_RE = /^\d{6}$/
const USED_CODE_MESSAGE = 'This code has already been used.'

function validateDraft(draft: QuizDraft): string | null {
  const title = draft.title?.trim() ?? ''
  if (!title || title.length > 100) return 'Give your quiz a title.'
  if (!Array.isArray(draft.questions) || draft.questions.length === 0)
    return 'Add at least one question.'
  if (draft.questions.length > 100) return 'A quiz can have up to 100 questions.'

  for (const [i, question] of draft.questions.entries()) {
    const n = i + 1
    if (!question.text?.trim()) return `Question ${n} is empty.`
    if (question.type !== 'single' && question.type !== 'multiple')
      return `Question ${n} has an invalid answer type.`
    if (!Array.isArray(question.options) || question.options.length < 2)
      return `Question ${n} needs at least 2 options.`
    if (question.options.length > 10)
      return `Question ${n} can have up to 10 options.`
    if (question.options.some((o) => !o?.trim()))
      return `Question ${n} has an empty option.`
    const correct = [...new Set(question.correct ?? [])]
    if (correct.some((c) => !Number.isInteger(c) || c < 0 || c >= question.options.length))
      return `Question ${n} has an invalid correct answer.`
    if (question.type === 'single' && correct.length !== 1)
      return `Question ${n} (Single) needs exactly one correct answer.`
    if (question.type === 'multiple' && correct.length < 1)
      return `Question ${n} (Select) needs at least one correct answer.`
  }
  return null
}

export async function isCodeAvailable(code: string) {
  await requireUser()
  if (!CODE_RE.test(code)) return false
  return readDb((db) => !db.usedCodes.includes(code))
}

export async function createQuiz(draft: QuizDraft): Promise<CreateQuizResult> {
  const user = await requireUser()

  const error = validateDraft(draft)
  if (error) return { ok: false, error }

  const code = draft.code?.trim() ?? ''
  if (!CODE_RE.test(code))
    return { ok: false, error: 'The code must be exactly 6 digits.' }

  const created = await writeDb((db) => {
    if (db.usedCodes.includes(code)) return false
    db.usedCodes.push(code)
    db.quizzes.push({
      id: newId(),
      code,
      title: draft.title.trim(),
      creatorId: user.id,
      creatorName: user.username,
      isPublic: Boolean(draft.isPublic),
      createdAt: Date.now(),
      questions: draft.questions.map((question) => ({
        id: newId(),
        text: question.text.trim(),
        type: question.type,
        options: question.options.map((o) => o.trim()),
        correct: [...new Set(question.correct)].sort((a, b) => a - b),
      })),
    })
    return true
  })

  if (!created) return { ok: false, error: USED_CODE_MESSAGE }
  return { ok: true, code }
}

export type EnterCodeState = { error?: string; code?: string }

export async function enterCode(
  _prev: EnterCodeState,
  formData: FormData,
): Promise<EnterCodeState> {
  await requireUser()
  const code = String(formData.get('code') ?? '').trim()
  if (!CODE_RE.test(code))
    return { error: 'Enter the 6-digit quiz code.', code }
  const exists = await readDb((db) => db.quizzes.some((q) => q.code === code))
  if (!exists) return { error: 'No quiz found with that code.', code }
  redirect(`/quiz/${code}`)
}

export async function submitAttempt(
  code: string,
  answers: number[][],
  durationMs: number,
) {
  const user = await requireUser()

  const saved = await writeDb((db) => {
    const quiz = db.quizzes.find((q) => q.code === code)
    if (!quiz) return 'missing' as const
    const already = db.attempts.some(
      (a) => a.quizCode === code && a.userId === user.id,
    )
    if (already) return 'done' as const

    const score = quiz.questions.reduce((total, question, i) => {
      const selected = Array.isArray(answers?.[i])
        ? answers[i].filter((n) => Number.isInteger(n))
        : []
      return total + (isCorrect([...new Set(selected)], question.correct) ? 1 : 0)
    }, 0)

    db.attempts.push({
      id: newId(),
      quizCode: code,
      userId: user.id,
      username: user.username,
      score,
      total: quiz.questions.length,
      durationMs: Math.min(
        Math.max(0, Number(durationMs) || 0),
        1000 * 60 * 60 * 24,
      ),
      createdAt: Date.now(),
    })
    return 'done' as const
  })

  if (saved === 'missing') redirect('/home')
  redirect(`/quiz/${code}/results`)
}
