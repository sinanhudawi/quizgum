'use client'

import { useState, useTransition } from 'react'
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react'
import { submitAttempt } from '@/app/actions/quiz'
import { Button } from '@/components/ui/button'
import type { PlayableQuiz } from '@/lib/quiz'
import { cn } from '@/lib/utils'

export function QuizPlayer({ quiz }: { quiz: PlayableQuiz }) {
  const total = quiz.questions.length
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<number[][]>(() => quiz.questions.map(() => []))
  const [startedAt] = useState(() => Date.now())
  const [pending, startTransition] = useTransition()

  const question = quiz.questions[index]
  const selected = answers[index]
  const isLast = index === total - 1
  const answeredCount = answers.filter((a) => a.length > 0).length

  const choose = (oi: number) =>
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== index) return a
        if (question.type === 'single') return [oi]
        return a.includes(oi) ? a.filter((x) => x !== oi) : [...a, oi]
      }),
    )

  const submit = () =>
    startTransition(async () => {
      await submitAttempt(quiz.code, answers, Date.now() - startedAt)
    })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-muted-foreground">
          Code {quiz.code} · by @{quiz.creatorName}
        </p>
        <h1 className="font-display text-3xl font-bold text-secondary-foreground text-balance">{quiz.title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-white/80"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
        >
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="font-display font-semibold text-secondary-foreground">
          {index + 1}/{total}
        </span>
      </div>

      <section
        key={question.id}
        aria-labelledby="question-text"
        className="qg-card flex animate-in flex-col gap-5 p-6 fade-in slide-in-from-right-6 duration-300"
      >
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-bold tracking-wide text-secondary-foreground uppercase">
            {question.type === 'single' ? 'Single · choose one' : 'Select · choose all that apply'}
          </span>
          <h2 id="question-text" className="font-display text-2xl font-semibold text-foreground text-pretty">
            {index + 1}. {question.text}
          </h2>
        </div>

        <div
          role={question.type === 'single' ? 'radiogroup' : 'group'}
          aria-labelledby="question-text"
          className="flex flex-col gap-3"
        >
          {question.options.map((option, oi) => {
            const isSelected = selected.includes(oi)
            return (
              <button
                key={oi}
                type="button"
                role={question.type === 'single' ? 'radio' : 'checkbox'}
                aria-checked={isSelected}
                onClick={() => choose(oi)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left font-semibold transition focus-visible:ring-4 focus-visible:ring-sky/30 focus-visible:outline-none',
                  isSelected ? 'border-primary bg-secondary text-secondary-foreground' : 'border-input hover:border-sky',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center border-2 font-display text-sm',
                    question.type === 'single' ? 'rounded-full' : 'rounded-lg',
                    isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input text-muted-foreground',
                  )}
                >
                  {isSelected ? <Check aria-hidden="true" className="size-4" /> : oi + 1}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="soft"
          size="xl"
          onClick={() => setIndex((i) => i - 1)}
          disabled={index === 0}
        >
          <ArrowLeft aria-hidden="true" />
          Back
        </Button>
        {isLast ? (
          <Button type="button" variant="pop" size="xl" onClick={submit} disabled={pending}>
            <Send aria-hidden="true" />
            {pending ? 'Submitting...' : `Submit (${answeredCount}/${total})`}
          </Button>
        ) : (
          <Button type="button" variant="brand" size="xl" onClick={() => setIndex((i) => i + 1)}>
            Next
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  )
}
