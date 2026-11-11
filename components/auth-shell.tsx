import Link from 'next/link'
import { Logo } from '@/components/logo'

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string
  subtitle: string
  footer: { text: string; linkLabel: string; href: string }
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="qg-card flex w-full max-w-lg flex-col gap-6 px-6 py-8 sm:px-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo className="w-36" />
          <h1 className="font-display text-3xl font-bold text-secondary-foreground">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        <p className="text-center text-sm text-muted-foreground">
          {footer.text}{' '}
          <Link href={footer.href} className="font-bold text-primary underline-offset-4 hover:underline">
            {footer.linkLabel}
          </Link>
        </p>
      </div>
    </main>
  )
}
