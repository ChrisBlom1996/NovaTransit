import { useCallback, useEffect } from 'react'
import { useTransitStore } from '../store/useTransitStore'
import { ErrorCard } from './ErrorCard'
import { LiveBadge } from './LiveBadge'
import { TransitErrorBoundary } from './TransitErrorBoundary'
import { TransitMap } from './TransitMap'

function DashboardBody() {
  const deliveries = useTransitStore((s) => s.deliveries)
  const loading = useTransitStore((s) => s.loading)
  const error = useTransitStore((s) => s.error)
  const fetchDeliveries = useTransitStore((s) => s.fetchDeliveries)
  const startLiveUpdates = useTransitStore((s) => s.startLiveUpdates)
  const stopLiveUpdates = useTransitStore((s) => s.stopLiveUpdates)

  const load = useCallback(async () => {
    stopLiveUpdates()
    const ok = await fetchDeliveries()
    if (ok) startLiveUpdates()
  }, [fetchDeliveries, startLiveUpdates, stopLiveUpdates])

  useEffect(() => {
    void load()
    return () => {
      stopLiveUpdates()
    }
  }, [load, stopLiveUpdates])

  const showLive = !loading && !error && deliveries.length > 0

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center p-5">
          <ErrorCard
            message="We couldn’t reach the transit feed. Check your connection and try again."
            onRetry={() => {
              void load()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top: live map */}
      <section className="relative h-[52%] min-h-[220px] shrink-0 border-b border-border">
        <TransitMap deliveries={deliveries} loading={loading} />
        {showLive ? <LiveBadge /> : null}
      </section>

      {/* Bottom: delivery feed (placeholder until feed UI is built) */}
      <section className="min-h-0 flex-1 bg-bg" aria-hidden={!loading} />
    </div>
  )
}

export function Dashboard() {
  const fetchDeliveries = useTransitStore((s) => s.fetchDeliveries)
  const startLiveUpdates = useTransitStore((s) => s.startLiveUpdates)
  const stopLiveUpdates = useTransitStore((s) => s.stopLiveUpdates)

  const handleRetry = useCallback(() => {
    void (async () => {
      stopLiveUpdates()
      const ok = await fetchDeliveries()
      if (ok) startLiveUpdates()
    })()
  }, [fetchDeliveries, startLiveUpdates, stopLiveUpdates])

  return (
    <TransitErrorBoundary onRetry={handleRetry}>
      <DashboardBody />
    </TransitErrorBoundary>
  )
}
