import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { QuizPlayer } from '@/components/quiz-player'
import { requireUser } from '@/lib/auth'
import { readDb } from '@/lib/db'
import type { PlayableQuiz } from '@/lib/quiz'

export const metadata: Metadata = { title: 'Play Quiz' }

export default async function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const user = await requireUser()

  const data = await readDb((db) => {
    const quiz = db.quizzes.find((q) => q.code === code)
    if (!quiz) return null
    const attempted = db.attempts.some((a) => a.quizCode === code && a.userId === user.id)
    const playable: PlayableQuiz = {
      code: quiz.code,
      title: quiz.title,
      creatorName: quiz.creatorName,
      questions: quiz.questions.map(({ id, text, type, options }) => ({ id, text, type, options })),
    }
    return { attempted, playable }
  })

  if (!data) notFound()
  if (data.attempted) redirect(`/quiz/${code}/results`)

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <QuizPlayer quiz={data.playable} />
      </main>
    </>
  )
}
