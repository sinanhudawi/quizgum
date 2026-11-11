import { LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import type { CurrentUser } from '@/lib/auth'

export function SiteHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 pt-4 sm:px-6">
      <Logo href="/home" className="w-28 sm:w-32" />
      <div className="flex items-center gap-3 rounded-full border-2 border-border bg-card py-1 pr-1 pl-4 backdrop-blur-md">
        <span className="max-w-32 truncate text-sm font-bold text-secondary-foreground sm:max-w-none">
          @{user.username}
        </span>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="rounded-full">
            <LogOut aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Sign out</span>
          </Button>
        </form>
      </div>
    </header>
  )
}
