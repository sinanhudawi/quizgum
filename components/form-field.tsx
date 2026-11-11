import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-12 w-full rounded-2xl border-2 border-input bg-white px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-sky focus-visible:ring-4 focus-visible:ring-sky/25'

export function FormField({
  label,
  id,
  className,
  ...props
}: ComponentProps<'input'> & { label: string; id: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-bold text-secondary-foreground">
        {label}
      </label>
      <input id={id} name={id} className={inputClass} {...props} />
    </div>
  )
}
