 
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth-shell'
import { SignInForm } from '@/components/sign-in-form'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Sign In',
  alternates: {
    canonical: 'https://v0-quizgum.vercel.app/sign-in',
  },
}

export default async function SignInPage() {
  if (await getCurrentUser()) redirect('/home')

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with the username and password you created."
      footer={{
        text: 'New to quizgum?',
        linkLabel: 'Register',
        href: '/register',
      }}
    >
      <SignInForm />
    </AuthShell>
  )
}
