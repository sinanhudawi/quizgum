'use client'

import { useActionState } from 'react'
import { signIn, type AuthState } from '@/app/actions/auth'
import { FormField } from '@/components/form-field'
import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'

export function SignInForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {})

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormField
        id="username"
        label="Username"
        autoComplete="username"
        defaultValue={state.fields?.username}
        required
      />
      <FormField id="password" label="Password" type="password" autoComplete="current-password" required />
      <FormError message={state.error} />
      <Button type="submit" variant="brand" size="xl" disabled={pending} className="mt-2 w-full">
        {pending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
