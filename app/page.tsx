import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogIn, UserPlus } from 'lucide-react'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default async function LandingPage() {
  const user = await getCurrentUser()
  if (user) redirect('/home')

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="qg-card flex w-full max-w-md flex-col items-center gap-6 px-6 py-10 text-center sm:px-10">
        <Logo className="w-56 sm:w-64" priority />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-secondary-foreground text-balance">
            Make quizzes. Share a code. Climb the ranks.
          </h1>
          <p className="text-muted-foreground text-pretty">
            Build your own quiz in minutes and challenge anyone with a unique 6-digit code.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Link href="/register" className={cn(buttonVariants({ variant: 'pop', size: 'xl' }), 'w-full')}>
            <UserPlus aria-hidden="true" />
            Register
          </Link>
          <Link href="/sign-in" className={cn(buttonVariants({ variant: 'brand', size: 'xl' }), 'w-full')}>
            <LogIn aria-hidden="true" />
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
