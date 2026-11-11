'use client'

import { useActionState } from 'react'
import { register, type AuthState } from '@/app/actions/auth'
import { FormField } from '@/components/form-field'
import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, {})
  const f = state.fields ?? {}

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormField id="fullName" label="Full Name" autoComplete="name" defaultValue={f.fullName} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="city" label="City" autoComplete="address-level2" defaultValue={f.city} required />
        <FormField id="country" label="Country" autoComplete="country-name" defaultValue={f.country} required />
      </div>
      <FormField
        id="contact"
        label="Phone Number or Gmail"
        placeholder="+1 555 123 4567 or you@gmail.com"
        defaultValue={f.contact}
        required
      />
      <FormField id="username" label="Username" autoComplete="username" defaultValue={f.username} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="password" label="Create Your Own Password" type="password" autoComplete="new-password" required />
        <FormField id="confirmPassword" label="Confirm Password" type="password" autoComplete="new-password" required />
      </div>
      <FormError message={state.error} />
      <Button type="submit" variant="pop" size="xl" disabled={pending} className="mt-2 w-full">
        {pending ? 'Creating account...' : 'Register'}
      </Button>
    </form>
  )
}
