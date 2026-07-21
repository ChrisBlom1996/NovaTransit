import { mockTransitService } from '../services/mockTransitService'
import { useTransitStore } from '../store/useTransitStore'

/**
 * Dev-only: exercise the mock API in the browser console.
 * Not wired to any UI.
 */
export function verifyMockApi(): void {
  const store = useTransitStore

  console.info('[NovaTransit] mock API verification starting…')

  store.subscribe((state, prev) => {
    if (state.loading !== prev.loading) {
      console.info('[NovaTransit] loading →', state.loading)
    }
    if (state.error !== prev.error && state.error) {
      console.warn('[NovaTransit] store error →', state.error)
    }
    if (state.deliveries !== prev.deliveries) {
      console.info(
        '[NovaTransit] deliveries →',
        state.deliveries.length,
        'items',
        state.deliveries.map((d) => ({
          id: d.id,
          status: d.status,
          distanceKm: d.distanceKm,
          etaMinutes: d.etaMinutes,
          lastUpdated: d.lastUpdated,
        })),
      )
    }
  })

  void (async () => {
    // Probe the 5% failure path before seeding the store / live feed
    let attempts = 0
    const maxAttempts = 80
    while (attempts < maxAttempts) {
      attempts += 1
      try {
        await mockTransitService.getDeliveries()
      } catch (err) {
        console.warn(
          `[NovaTransit] simulated network failure after ${attempts} probe(s):`,
          err instanceof Error ? err.message : err,
        )
        break
      }
    }
    if (attempts >= maxAttempts) {
      console.info(
        `[NovaTransit] no failure in ${maxAttempts} probes (5% chance — try reload)`,
      )
    }

    await store.getState().fetchDeliveries()
    const afterFetch = store.getState()
    if (afterFetch.error) {
      console.warn('[NovaTransit] store fetch failed, retrying once…')
      await store.getState().fetchDeliveries()
    }

    store.getState().startLiveUpdates()
    console.info('[NovaTransit] live updates started (every 4–6s)')
  })()
}
