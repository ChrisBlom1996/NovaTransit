type ErrorCardProps = {
  message: string
  onRetry: () => void
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div
      role="alert"
      className="w-full max-w-[280px] rounded-lg border border-border bg-surface px-5 py-5 text-center"
    >
      <p className="font-label text-sm font-medium text-text-primary">
        Connection interrupted
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="
          mt-4 w-full rounded-md bg-accent-steel/20 px-4 py-2.5
          font-label text-sm font-medium text-accent-steel
          transition-colors hover:bg-accent-steel/30
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        "
      >
        Retry
      </button>
    </div>
  )
}
