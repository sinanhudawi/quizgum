import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Ticket } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { EnterCodeForm } from '@/components/enter-code-form'
import { TemplateList } from '@/components/template-list'
import { buttonVariants } from '@/components/ui/button'
import { requireUser } from '@/lib/auth'
import { readDb } from '@/lib/db'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Home' }

export default async function HomePage() {
  const user = await requireUser()
  const templates = await readDb((db) =>
    db.quizzes
      .filter((q) => q.isPublic)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((q) => ({
        code: q.code,
        title: q.title,
        creatorName: q.creatorName,
        questionCount: q.questions.length,
        plays: db.attempts.filter((a) => a.quizCode === q.code).length,
      })),
  )

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div>
          <p className="font-bold text-muted-foreground">Hi {user.fullName.split(' ')[0]},</p>
          <h1 className="font-display text-4xl font-bold text-secondary-foreground text-balance">
            What would you like to do?
          </h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section aria-labelledby="generate-heading" className="qg-card flex flex-col gap-4 p-6">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent-shadow">
              <Sparkles aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 id="generate-heading" className="font-display text-2xl font-semibold text-secondary-foreground">
                Generate Quiz
              </h2>
              <p className="text-muted-foreground">
                Write your questions, add options, mark the right answers and lock it with your own 6-digit code.
              </p>
            </div>
            <Link href="/create" className={cn(buttonVariants({ variant: 'pop', size: 'xl' }), 'mt-auto w-full')}>
              Generate Quiz
            </Link>
          </section>

          <section aria-labelledby="enter-heading" className="qg-card flex flex-col gap-4 p-6">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Ticket aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 id="enter-heading" className="font-display text-2xl font-semibold text-secondary-foreground">
                Enter Code
              </h2>
              <p className="text-muted-foreground">Got a code from a friend? Type it in to join their quiz.</p>
            </div>
            <EnterCodeForm />
          </section>
        </div>

        <TemplateList templates={templates} />
      </main>
    </>
  )
}
