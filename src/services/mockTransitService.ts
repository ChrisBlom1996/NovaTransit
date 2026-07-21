import type { Delivery, DeliveryStatus } from '../types'

/** Cape Town CBD — fixed hub for mock geospatial scatter */
export const TRANSIT_HUB = { lat: -33.9249, lng: 18.4241 } as const

const DESTINATIONS = [
  'V&A Waterfront Depot',
  'Sea Point Hub',
  'Woodstock Warehouse',
  'Century City Gate',
  'Claremont Drop',
  'Bellville Crossdock',
  'Airport Cargo Bay',
  'Observatory Stop',
  'Green Point Terminal',
  'Mowbray Yard',
] as const

let currentDeliveries: Delivery[] = []
let liveTimer: ReturnType<typeof setTimeout> | null = null

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function offsetCoord(center: number, spreadDegrees: number): number {
  return round(center + (Math.random() - 0.5) * 2 * spreadDegrees, 5)
}

function generateDeliveries(count = 8): Delivery[] {
  const now = Date.now()
  const shuffled = [...DESTINATIONS].sort(() => Math.random() - 0.5)

  // Guarantee a visible mix of all three statuses (amber / steel / danger)
  const statusPool: DeliveryStatus[] = []
  while (statusPool.length < count) {
    statusPool.push('pending', 'en_route', 'delayed')
  }
  const statuses = statusPool
    .slice(0, count)
    .sort(() => Math.random() - 0.5)

  return Array.from({ length: count }, (_, index) => {
    const status = statuses[index]!
    const distanceKm = round(randomBetween(1.2, 28))
    const etaMinutes = Math.round(
      distanceKm * randomBetween(2.2, 3.8) +
        (status === 'delayed' ? randomBetween(8, 22) : 0),
    )

    return {
      id: `NT-${String(1000 + index + Math.floor(Math.random() * 8000))}`,
      destination: shuffled[index % shuffled.length]!,
      distanceKm,
      etaMinutes,
      status,
      lat: offsetCoord(TRANSIT_HUB.lat, 0.08),
      lng: offsetCoord(TRANSIT_HUB.lng, 0.1),
      lastUpdated: new Date(now - Math.floor(randomBetween(0, 120_000))).toISOString(),
    }
  })
}

function mutateDelivery(delivery: Delivery): Delivery {
  const next = { ...delivery }
  const driftKm = randomBetween(-1.4, 0.4)
  next.distanceKm = Math.max(0.3, round(next.distanceKm + driftKm))

  const etaDrift = Math.round(randomBetween(-6, 4))
  next.etaMinutes = Math.max(1, next.etaMinutes + etaDrift)

  // Rotate statuses in both directions so pending (amber) doesn't drain away
  if (Math.random() < 0.28) {
    if (next.status === 'pending') {
      next.status = Math.random() < 0.7 ? 'en_route' : 'delayed'
    } else if (next.status === 'en_route') {
      const roll = Math.random()
      next.status = roll < 0.35 ? 'delayed' : roll < 0.55 ? 'pending' : 'en_route'
    } else {
      // delayed
      next.status = Math.random() < 0.45 ? 'en_route' : 'pending'
    }
  }

  next.lastUpdated = new Date().toISOString()
  return next
}

/**
 * Mock logistics API — async delays, rare failures, and a polling-style live feed.
 */
export const mockTransitService = {
  async getDeliveries(): Promise<Delivery[]> {
    await delay(randomBetween(400, 800))

    if (Math.random() < 0.05) {
      throw new Error('Network request failed: unable to reach transit API')
    }

    currentDeliveries = generateDeliveries(8)
    return currentDeliveries.map((d) => ({ ...d }))
  },

  /**
   * Simulates a live websocket feed by mutating 1–2 deliveries every 4–6s.
   * Returns a stop function to clear the interval.
   */
  startLiveUpdates(callback: (deliveries: Delivery[]) => void): () => void {
    const clear = () => {
      if (liveTimer !== null) {
        clearTimeout(liveTimer)
        liveTimer = null
      }
    }

    clear()

    const tick = () => {
      if (currentDeliveries.length === 0) {
        liveTimer = setTimeout(tick, randomBetween(4000, 6000))
        return
      }

      const updateCount = Math.random() < 0.5 ? 1 : 2
      const indices = new Set<number>()
      while (indices.size < Math.min(updateCount, currentDeliveries.length)) {
        indices.add(Math.floor(Math.random() * currentDeliveries.length))
      }

      currentDeliveries = currentDeliveries.map((delivery, index) =>
        indices.has(index) ? mutateDelivery(delivery) : delivery,
      )

      callback(currentDeliveries.map((d) => ({ ...d })))
      liveTimer = setTimeout(tick, randomBetween(4000, 6000))
    }

    liveTimer = setTimeout(tick, randomBetween(4000, 6000))
    return clear
  },
}
