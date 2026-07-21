import clsx from 'clsx'
import type { SortBy, StatusFilter } from '../store/transitSelectors'
import { useTransitStore } from '../store/useTransitStore'

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: 'eta', label: 'ETA' },
  { value: 'distance', label: 'Distance' },
]

const FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'en_route', label: 'En Route' },
  { value: 'delayed', label: 'Delayed' },
]

export function FeedControls() {
  const sortBy = useTransitStore((s) => s.sortBy)
  const statusFilter = useTransitStore((s) => s.statusFilter)
  const searchQuery = useTransitStore((s) => s.searchQuery)
  const setSortBy = useTransitStore((s) => s.setSortBy)
  const setStatusFilter = useTransitStore((s) => s.setStatusFilter)
  const setSearchQuery = useTransitStore((s) => s.setSearchQuery)

  return (
    <div
      className="shrink-0 space-y-2.5 border-b border-border px-3 pb-3"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <label className="block">
        <span className="sr-only">Search destinations</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search destinations"
          className="
            w-full rounded-md border border-border bg-white/[0.04] px-3 py-2
            text-sm text-text-primary placeholder:text-text-muted/70
            outline-none transition-colors
            focus:border-accent-steel/50 focus:bg-white/[0.06]
          "
        />
      </label>

      <div className="flex items-center justify-between gap-2">
        <p className="label text-[10px] uppercase tracking-wider text-text-muted">
          Sort
        </p>
        <div
          className="flex rounded-md border border-border bg-white/[0.03] p-0.5"
          role="group"
          aria-label="Sort deliveries"
        >
          {SORT_OPTIONS.map((option) => {
            const active = sortBy === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSortBy(option.value)}
                aria-pressed={active}
                className={clsx(
                  'rounded-[5px] px-2.5 py-1 font-label text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-accent-steel/25 text-accent-steel'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Filter by status"
      >
        {FILTER_OPTIONS.map((option) => {
          const active = statusFilter === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              aria-pressed={active}
              className={clsx(
                'rounded-full border px-2.5 py-1 font-label text-[11px] font-medium transition-colors',
                active
                  ? option.value === 'pending'
                    ? 'border-accent-amber/40 bg-accent-amber/15 text-accent-amber'
                    : option.value === 'en_route'
                      ? 'border-accent-steel/40 bg-accent-steel/15 text-accent-steel'
                      : option.value === 'delayed'
                        ? 'border-danger/40 bg-danger/15 text-danger'
                        : 'border-border bg-white/10 text-text-primary'
                  : 'border-border bg-transparent text-text-muted hover:text-text-primary',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
