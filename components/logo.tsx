import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  href = '/',
  priority,
}: {
  className?: string
  href?: string
  priority?: boolean
}) {
  return (
    <Link href={href} className={cn('inline-block', className)}>
      <Image
        src="/images/logo.png"
        alt="quizgum"
        width={717}
        height={501}
        priority={priority}
        className="h-auto w-full mix-blend-multiply"
      />
    </Link>
  )
}
