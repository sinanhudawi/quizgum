 
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth-shell'
import { RegisterForm } from '@/components/register-form'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Register',
  alternates: {
    canonical: 'https://v0-quizgum.vercel.app/register',
  },
}

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect('/home')

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join quizgum to build and play quizzes."
      footer={{
        text: 'Already have an account?',
        linkLabel: 'Sign in',
        href: '/sign-in',
      }}
    >
      <RegisterForm />
    </AuthShell>
  )
}
