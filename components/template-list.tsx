import Link from 'next/link'
import { LayoutTemplate, Users } from 'lucide-react'

type Template = {
  code: string
  title: string
  creatorName: string
  questionCount: number
  plays: number
}

export function TemplateList({ templates }: { templates: Template[] }) {
  return (
    <section aria-labelledby="templates-heading" className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LayoutTemplate aria-hidden="true" className="text-primary" />
        <h2 id="templates-heading" className="font-display text-2xl font-semibold text-secondary-foreground">
          Use Templates
        </h2>
      </div>
      {templates.length === 0 ? (
        <p className="qg-card p-6 text-muted-foreground">No public templates yet. Make one and share it!</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <li key={t.code}>
              <Link
                href={`/quiz/${t.code}`}
                className="qg-card flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sky/40 focus-visible:outline-none"
              >
                <span className="w-fit rounded-full bg-secondary px-3 py-1 font-display text-sm font-semibold tracking-widest text-secondary-foreground">
                  {t.code}
                </span>
                <h3 className="font-display text-xl font-semibold text-foreground text-balance">{t.title}</h3>
                <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {t.questionCount} {t.questionCount === 1 ? 'question' : 'questions'} · by @{t.creatorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users aria-hidden="true" className="size-4" />
                    {t.plays}
                    <span className="sr-only">plays</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
