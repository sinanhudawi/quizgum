import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { QuizBuilder } from '@/components/quiz-builder'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Generate Quiz' }

export default async function CreatePage() {
  const user = await requireUser()
  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <QuizBuilder />
      </main>
    </>
  )
}
