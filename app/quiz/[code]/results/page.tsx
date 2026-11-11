import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Leaderboard } from '@/components/leaderboard'
import { buttonVariants } from '@/components/ui/button'
import { requireUser } from '@/lib/auth'
import { readDb } from '@/lib/db'
import { formatDuration, rankAttempts } from '@/lib/quiz'

export const metadata: Metadata = { title: 'Results' }

export default async function ResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const user = await requireUser()

  const data = await readDb((db) => {
    const quiz = db.quizzes.find((q) => q.code === code)
    if (!quiz) return null
    const ranked = rankAttempts(db.attempts.filter((a) => a.quizCode === code))
    return { title: quiz.title, ranked }
  })

  if (!data) notFound()
  const position = data.ranked.findIndex((a) => a.userId === user.id)
  if (position === -1) redirect(`/quiz/${code}`)

  const mine = data.ranked[position]
  const percentage = mine.total ? Math.round((mine.score / mine.total) * 100) : 0
  const rows = data.ranked.map((a, i) => ({
    rank: i + 1,
    username: a.username,
    score: a.score,
    total: a.total,
    percentage: a.total ? Math.round((a.score / a.total) * 100) : 0,
    time: formatDuration(a.durationMs),
    isMe: a.userId === user.id,
  }))

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
        <section className="qg-card flex flex-col items-center gap-4 px-6 py-8 text-center">
          <Trophy aria-hidden="true" className="size-12 text-accent" />
          <p className="font-bold text-muted-foreground">{data.title}</p>
          <h1 className="font-display text-3xl font-bold text-secondary-foreground">Quiz complete!</h1>
          <dl className="grid w-full grid-cols-3 gap-3">
            <div className="rounded-2xl bg-secondary p-4">
              <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Score</dt>
              <dd className="font-display text-3xl font-bold text-primary">
                {mine.score}/{mine.total}
              </dd>
            </div>
            <div className="rounded-2xl bg-accent/15 p-4">
              <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Percentage</dt>
              <dd className="font-display text-3xl font-bold text-accent-shadow">{percentage}%</dd>
            </div>
            <div className="rounded-2xl bg-secondary p-4">
              <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Rank</dt>
              <dd className="font-display text-3xl font-bold text-primary">
                #{position + 1}
                <span className="text-base text-muted-foreground"> of {data.ranked.length}</span>
              </dd>
            </div>
          </dl>
        </section>

        <Leaderboard rows={rows} />

        <Link href="/home" className={buttonVariants({ variant: 'brand', size: 'xl' })}>
          Back to Home
        </Link>
      </main>
    </>
  )
}
