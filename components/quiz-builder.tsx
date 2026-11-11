'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, CheckCircle2, Plus, Trash2, X } from 'lucide-react'
import { createQuiz, type QuizDraft } from '@/app/actions/quiz'
import { FormError } from '@/components/form-error'
import { inputClass } from '@/components/form-field'
import { Button, buttonVariants } from '@/components/ui/button'
import type { QuestionType } from '@/lib/db'
import { cn } from '@/lib/utils'

type DraftQuestion = {
  key: string
  text: string
  type: QuestionType
  options: { key: string; text: string }[]
  correct: number[]
}

let counter = 0
const uid = () => `k${++counter}`

const emptyQuestion = (): DraftQuestion => ({
  key: uid(),
  text: '',
  type: 'single',
  options: [],
  correct: [],
})

function validate(title: string, questions: DraftQuestion[]): string | null {
  if (!title.trim()) return 'Give your quiz a title.'
  if (questions.length === 0) return 'Add at least one question.'
  for (const [i, q] of questions.entries()) {
    const n = i + 1
    if (!q.text.trim()) return `Question ${n} is empty.`
    if (q.options.length < 2) return `Question ${n} needs at least 2 options.`
    if (q.options.some((o) => !o.text.trim())) return `Question ${n} has an empty option.`
    if (q.type === 'single' && q.correct.length !== 1)
      return `Mark the right answer for question ${n}.`
    if (q.type === 'multiple' && q.correct.length < 1)
      return `Mark at least one right answer for question ${n}.`
  }
  return null
}

export function QuizBuilder() {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()])
  const [error, setError] = useState<string>()
  const [step, setStep] = useState<'edit' | 'code' | 'done'>('edit')
  const [code, setCode] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [codeError, setCodeError] = useState<string>()
  const [createdCode, setCreatedCode] = useState('')
  const [pending, startTransition] = useTransition()
  const codeSectionRef = useRef<HTMLElement>(null)

  const update = (index: number, fn: (q: DraftQuestion) => DraftQuestion) => {
    setQuestions((qs) => qs.map((q, i) => (i === index ? fn(q) : q)))
    if (step === 'code') setStep('edit')
  }

  const toggleCorrect = (qi: number, oi: number) =>
    update(qi, (q) => {
      if (q.type === 'single') return { ...q, correct: [oi] }
      return {
        ...q,
        correct: q.correct.includes(oi) ? q.correct.filter((c) => c !== oi) : [...q.correct, oi],
      }
    })

  const removeOption = (qi: number, oi: number) =>
    update(qi, (q) => ({
      ...q,
      options: q.options.filter((_, i) => i !== oi),
      correct: q.correct.filter((c) => c !== oi).map((c) => (c > oi ? c - 1 : c)),
    }))

  const handleGenerate = () => {
    const message = validate(title, questions)
    setError(message ?? undefined)
    if (message) return
    setStep('code')
    requestAnimationFrame(() => codeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const handleCreate = () => {
    if (!/^\d{6}$/.test(code)) {
      setCodeError('The code must be exactly 6 digits.')
      return
    }
    setCodeError(undefined)
    const draft: QuizDraft = {
      title,
      isPublic,
      code,
      questions: questions.map((q) => ({
        text: q.text,
        type: q.type,
        options: q.options.map((o) => o.text),
        correct: q.correct,
      })),
    }
    startTransition(async () => {
      const result = await createQuiz(draft)
      if (result.ok) {
        setCreatedCode(result.code)
        setStep('done')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setCodeError(result.error)
      }
    })
  }

  if (step === 'done') {
    return (
      <section className="qg-card flex flex-col items-center gap-5 px-6 py-10 text-center">
        <CheckCircle2 aria-hidden="true" className="size-14 text-success" />
        <h1 className="font-display text-3xl font-bold text-secondary-foreground">Your quiz is ready!</h1>
        <p className="text-muted-foreground">Share this code so others can join from “Enter Code”.</p>
        <p className="rounded-3xl bg-secondary px-8 py-4 font-display text-4xl font-bold tracking-[0.3em] text-primary">
          {createdCode}
        </p>
        {isPublic && <p className="text-sm font-semibold text-accent-shadow">Published as a public template.</p>}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/home" className={buttonVariants({ variant: 'soft', size: 'xl' })}>
            Back to Home
          </Link>
          <Link href={`/quiz/${createdCode}`} className={buttonVariants({ variant: 'brand', size: 'xl' })}>
            Try it now
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link href="/home" className="flex w-fit items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Home
        </Link>
        <h1 className="font-display text-4xl font-bold text-secondary-foreground">Generate Quiz</h1>
      </div>

      <div className="qg-card flex flex-col gap-2 p-5">
        <label htmlFor="quiz-title" className="text-sm font-bold text-secondary-foreground">
          Quiz title
        </label>
        <input
          id="quiz-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="e.g. Friday Fun Facts"
          className={inputClass}
        />
      </div>

      <ol className="flex flex-col gap-5">
        {questions.map((q, qi) => (
          <li key={q.key} className="qg-card flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {qi + 1}
              </span>
              <div role="radiogroup" aria-label={`Answer type for question ${qi + 1}`} className="flex rounded-full bg-muted p-1">
                {(['single', 'multiple'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={q.type === type}
                    onClick={() =>
                      update(qi, (cur) => ({
                        ...cur,
                        type,
                        correct: type === 'single' ? cur.correct.slice(0, 1) : cur.correct,
                      }))
                    }
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-bold transition',
                      q.type === type ? 'bg-accent text-accent-foreground shadow' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {type === 'single' ? 'Single' : 'Select'}
                  </button>
                ))}
              </div>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="rounded-full text-muted-foreground"
                  onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}
                >
                  <Trash2 aria-hidden="true" />
                  <span className="sr-only">Delete question {qi + 1}</span>
                </Button>
              )}
            </div>

            <label htmlFor={`q-${q.key}`} className="sr-only">
              Question {qi + 1}
            </label>
            <input
              id={`q-${q.key}`}
              value={q.text}
              onChange={(e) => update(qi, (cur) => ({ ...cur, text: e.target.value }))}
              placeholder="Type your question"
              className={inputClass}
            />

            <p className="text-xs font-semibold text-muted-foreground">
              {q.type === 'single'
                ? 'Single: tap the circle next to the one right answer.'
                : 'Select: tick every right answer.'}
            </p>

            {q.options.length > 0 && (
              <ol className="flex flex-col gap-2">
                {q.options.map((o, oi) => {
                  const checked = q.correct.includes(oi)
                  return (
                    <li key={o.key} className="flex items-center gap-2">
                      <span className="w-6 text-center font-display font-semibold text-muted-foreground">{oi + 1}</span>
                      <button
                        type="button"
                        role={q.type === 'single' ? 'radio' : 'checkbox'}
                        aria-checked={checked}
                        aria-label={`Mark option ${oi + 1} as correct`}
                        onClick={() => toggleCorrect(qi, oi)}
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center border-2 transition',
                          q.type === 'single' ? 'rounded-full' : 'rounded-lg',
                          checked ? 'border-success bg-success text-white' : 'border-input bg-white hover:border-success',
                        )}
                      >
                        {checked && <Check aria-hidden="true" className="size-4" />}
                      </button>
                      <label htmlFor={`o-${o.key}`} className="sr-only">
                        Option {oi + 1}
                      </label>
                      <input
                        id={`o-${o.key}`}
                        value={o.text}
                        onChange={(e) =>
                          update(qi, (cur) => ({
                            ...cur,
                            options: cur.options.map((opt, i) => (i === oi ? { ...opt, text: e.target.value } : opt)),
                          }))
                        }
                        placeholder={`Option ${oi + 1}`}
                        className={cn(inputClass, 'h-10', checked && 'border-success/60')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground"
                        onClick={() => removeOption(qi, oi)}
                      >
                        <X aria-hidden="true" />
                        <span className="sr-only">Remove option {oi + 1}</span>
                      </Button>
                    </li>
                  )
                })}
              </ol>
            )}

            <Button
              type="button"
              variant="soft"
              size="lg"
              className="w-fit"
              disabled={q.options.length >= 10}
              onClick={() => update(qi, (cur) => ({ ...cur, options: [...cur.options, { key: uid(), text: '' }] }))}
            >
              <Plus aria-hidden="true" />
              Add Options
            </Button>
          </li>
        ))}
      </ol>

      <Button
        type="button"
        variant="soft"
        size="xl"
        className="border-dashed"
        onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
      >
        <Plus aria-hidden="true" />
        Add Question
      </Button>

      <FormError message={error} />
      <Button type="button" variant="pop" size="xl" onClick={handleGenerate}>
        Generate Quiz
      </Button>

      {step === 'code' && (
        <section
          ref={codeSectionRef}
          aria-labelledby="code-heading"
          className="qg-card flex scroll-mt-6 flex-col gap-4 p-6"
        >
          <h2 id="code-heading" className="font-display text-2xl font-semibold text-secondary-foreground">
            Make a 6-Digit Code
          </h2>
          <p className="text-muted-foreground">Pick a unique code. Each code can only be used once.</p>
          <label htmlFor="quiz-code" className="sr-only">
            6-digit code
          </label>
          <input
            id="quiz-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="000000"
            className={cn(inputClass, 'h-14 text-center font-display text-2xl tracking-[0.4em]')}
          />
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-secondary/70 p-4">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="size-5 accent-[var(--accent)]"
            />
            <span className="flex flex-col">
              <span className="font-bold text-secondary-foreground">Make this public template</span>
              <span className="text-sm text-muted-foreground">Everyone will see it under “Use Templates” on their home page.</span>
            </span>
          </label>
          <FormError message={codeError} />
          <Button type="button" variant="brand" size="xl" onClick={handleCreate} disabled={pending}>
            {pending ? 'Generating...' : 'Generate'}
          </Button>
        </section>
      )}
    </div>
  )
}
