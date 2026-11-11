'use client'

import { useActionState } from 'react'
import { enterCode, type EnterCodeState } from '@/app/actions/quiz'
import { FormError } from '@/components/form-error'
import { inputClass } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EnterCodeForm() {
  const [state, action, pending] = useActionState<EnterCodeState, FormData>(enterCode, {})

  return (
    <form action={action} className="mt-auto flex flex-col gap-2">
      <label htmlFor="code" className="sr-only">
        6-digit quiz code
      </label>
      <div className="flex gap-2">
        <input
          id="code"
          name="code"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          autoComplete="off"
          placeholder="000000"
          defaultValue={state.code}
          className={cn(inputClass, 'text-center font-display text-xl tracking-[0.4em]')}
          required
        />
        <Button type="submit" variant="brand" size="xl" disabled={pending}>
          {pending ? 'Joining...' : 'Join'}
        </Button>
      </div>
      <FormError message={state.error} />
    </form>
  )
}
