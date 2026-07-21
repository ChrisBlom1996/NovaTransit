import { useCallback, useEffect, useState } from 'react'
import { useTransitStore } from '../store/useTransitStore'
import { DeliverySheet } from './DeliverySheet'
import { ErrorCard } from './ErrorCard'
import { LiveBadge } from './LiveBadge'
import { TransitErrorBoundary } from './TransitErrorBoundary'
import { TransitMap } from './TransitMap'

type SheetSnap = 'collapsed' | 'expanded'

function DashboardBody() {
  const deliveries = useTransitStore((s) => s.deliveries)
  const loading = useTransitStore((s) => s.loading)
  const error = useTransitStore((s) => s.error)
  const selectedId = useTransitStore((s) => s.selectedId)
  const fetchDeliveries = useTransitStore((s) => s.fetchDeliveries)
  const startLiveUpdates = useTransitStore((s) => s.startLiveUpdates)
  const stopLiveUpdates = useTransitStore((s) => s.stopLiveUpdates)

  const [snap, setSnap] = useState<SheetSnap>('collapsed')
  const [layoutRevision, setLayoutRevision] = useState(0)

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

  const handleSnapChange = useCallback((next: SheetSnap) => {
    setSnap(next)
    // Let the sheet spring settle, then refresh Leaflet layout
    window.setTimeout(() => setLayoutRevision((n) => n + 1), 280)
  }, [])

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
    <div className="relative h-full min-h-0 overflow-hidden">
      {/* z-0 traps Leaflet's internal z-indexes (200–700) below the sheet */}
      <div className="absolute inset-0 z-0">
        <TransitMap
          deliveries={deliveries}
          loading={loading}
          selectedId={selectedId}
          layoutRevision={layoutRevision}
        />
        {showLive ? <LiveBadge /> : null}
      </div>

      {/* Mounted here — above the map, peeked by default */}
      <DeliverySheet snap={snap} onSnapChange={handleSnapChange} />
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
