export function FormError({ message }: { message?: string }) {
  return (
    <p role="alert" aria-live="polite" className="min-h-5 text-sm font-semibold text-destructive">
      {message}
    </p>
  )
}
