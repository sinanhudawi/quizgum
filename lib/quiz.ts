import type { Attempt, QuestionType } from './db'

export type PlayableQuestion = {
  id: string
  text: string
  type: QuestionType
  options: string[]
}

export type PlayableQuiz = {
  code: string
  title: string
  creatorName: string
  questions: PlayableQuestion[]
}

export function isCorrect(selected: number[], correct: number[]) {
  if (selected.length !== correct.length) return false
  const a = [...selected].sort((x, y) => x - y)
  const b = [...correct].sort((x, y) => x - y)
  return a.every((value, i) => value === b[i])
}

export function rankAttempts(attempts: Attempt[]) {
  return [...attempts].sort(
    (a, b) =>
      b.score - a.score ||
      a.durationMs - b.durationMs ||
      a.createdAt - b.createdAt,
  )
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}
