import type { Delivery } from '../types'

/** Cape Town CBD — fixed hub for mock geospatial scatter */
export const TRANSIT_HUB = { lat: -33.9249, lng: 18.4241 } as const

/** Stable IDs so scenario scripts can target specific routes */
export const SEED_DELIVERIES: Omit<Delivery, 'lastUpdated'>[] = [
  {
    id: 'NT-1001',
    destination: 'Century City Gate',
    distanceKm: 14.2,
    etaMinutes: 38,
    status: 'pending',
    reason: null,
    lat: -33.8942,
    lng: 18.5126,
  },
  {
    id: 'NT-1002',
    destination: 'V&A Waterfront Depot',
    distanceKm: 6.4,
    etaMinutes: 18,
    status: 'en_route',
    reason: null,
    lat: -33.9036,
    lng: 18.4202,
  },
  {
    id: 'NT-1003',
    destination: 'Airport Cargo Bay',
    distanceKm: 19.8,
    etaMinutes: 52,
    status: 'en_route',
    reason: null,
    lat: -33.9687,
    lng: 18.5975,
  },
  {
    id: 'NT-1004',
    destination: 'Sea Point Hub',
    distanceKm: 8.1,
    etaMinutes: 24,
    status: 'pending',
    reason: null,
    lat: -33.9175,
    lng: 18.3876,
  },
  {
    id: 'NT-1005',
    destination: 'Bellville Crossdock',
    distanceKm: 22.4,
    etaMinutes: 61,
    status: 'delayed',
    reason: 'Depot dwell',
    lat: -33.9006,
    lng: 18.6289,
  },
  {
    id: 'NT-1006',
    destination: 'Claremont Drop',
    distanceKm: 11.3,
    etaMinutes: 31,
    status: 'en_route',
    reason: null,
    lat: -33.9824,
    lng: 18.4651,
  },
  {
    id: 'NT-1007',
    destination: 'Woodstock Warehouse',
    distanceKm: 5.2,
    etaMinutes: 16,
    status: 'pending',
    reason: null,
    lat: -33.9278,
    lng: 18.4472,
  },
  {
    id: 'NT-1008',
    destination: 'Observatory Stop',
    distanceKm: 9.6,
    etaMinutes: 27,
    status: 'en_route',
    reason: null,
    lat: -33.9391,
    lng: 18.4688,
  },
]

type DeliveryPatch = Partial<
  Pick<Delivery, 'status' | 'reason' | 'etaMinutes' | 'distanceKm'>
>

export type ScenarioEvent = {
  atSecond: number
  deliveryId: string
  patch: DeliveryPatch
}

export type ScenarioScript = {
  id: string
  label: string
  /** Loop length — after this, the director restarts from seed baseline */
  durationSeconds: number
  events: ScenarioEvent[]
}

/**
 * Hand-written ops narratives. Times are seconds from cycle start.
 * Designed so a ~30s watch always sees a status change + reason.
 */
export const SCENARIO_SCRIPTS: ScenarioScript[] = [
  {
    id: 'n1-traffic',
    label: 'N1 corridor delay',
    durationSeconds: 36,
    events: [
      {
        atSecond: 5,
        deliveryId: 'NT-1001',
        patch: {
          status: 'en_route',
          reason: 'Departed Century City',
          etaMinutes: 36,
          distanceKm: 13.6,
        },
      },
      {
        atSecond: 12,
        deliveryId: 'NT-1001',
        patch: {
          status: 'delayed',
          reason: 'Traffic on N1',
          etaMinutes: 54,
          distanceKm: 12.9,
        },
      },
      {
        atSecond: 22,
        deliveryId: 'NT-1001',
        patch: {
          status: 'en_route',
          reason: 'Cleared N1 — moving again',
          etaMinutes: 41,
          distanceKm: 11.4,
        },
      },
      {
        atSecond: 30,
        deliveryId: 'NT-1001',
        patch: {
          status: 'en_route',
          reason: null,
          etaMinutes: 34,
          distanceKm: 9.8,
        },
      },
      {
        atSecond: 14,
        deliveryId: 'NT-1005',
        patch: {
          status: 'en_route',
          reason: 'Released from crossdock',
          etaMinutes: 48,
          distanceKm: 20.1,
        },
      },
      {
        atSecond: 26,
        deliveryId: 'NT-1005',
        patch: {
          status: 'delayed',
          reason: 'Driver break',
          etaMinutes: 55,
          distanceKm: 19.4,
        },
      },
    ],
  },
  {
    id: 'waterfront-dwell',
    label: 'Waterfront dwell & release',
    durationSeconds: 32,
    events: [
      {
        atSecond: 6,
        deliveryId: 'NT-1002',
        patch: {
          status: 'delayed',
          reason: 'Depot dwell',
          etaMinutes: 29,
          distanceKm: 6.4,
        },
      },
      {
        atSecond: 14,
        deliveryId: 'NT-1002',
        patch: {
          status: 'en_route',
          reason: 'Bay cleared — rolling',
          etaMinutes: 20,
          distanceKm: 5.7,
        },
      },
      {
        atSecond: 24,
        deliveryId: 'NT-1002',
        patch: {
          status: 'en_route',
          reason: null,
          etaMinutes: 14,
          distanceKm: 4.2,
        },
      },
      {
        atSecond: 8,
        deliveryId: 'NT-1004',
        patch: {
          status: 'en_route',
          reason: 'Left Sea Point staging',
          etaMinutes: 22,
          distanceKm: 7.8,
        },
      },
      {
        atSecond: 18,
        deliveryId: 'NT-1004',
        patch: {
          status: 'delayed',
          reason: 'Roadworks on Beach Rd',
          etaMinutes: 31,
          distanceKm: 7.1,
        },
      },
    ],
  },
  {
    id: 'airport-push',
    label: 'Airport cargo push',
    durationSeconds: 34,
    events: [
      {
        atSecond: 4,
        deliveryId: 'NT-1003',
        patch: {
          status: 'delayed',
          reason: 'Holding for airside slot',
          etaMinutes: 68,
          distanceKm: 19.8,
        },
      },
      {
        atSecond: 11,
        deliveryId: 'NT-1003',
        patch: {
          status: 'en_route',
          reason: 'Slot open — outbound',
          etaMinutes: 49,
          distanceKm: 18.2,
        },
      },
      {
        atSecond: 20,
        deliveryId: 'NT-1003',
        patch: {
          status: 'en_route',
          reason: null,
          etaMinutes: 38,
          distanceKm: 15.6,
        },
      },
      {
        atSecond: 9,
        deliveryId: 'NT-1006',
        patch: {
          status: 'delayed',
          reason: 'Customer not ready',
          etaMinutes: 44,
          distanceKm: 11.3,
        },
      },
      {
        atSecond: 25,
        deliveryId: 'NT-1006',
        patch: {
          status: 'en_route',
          reason: 'Receiver confirmed',
          etaMinutes: 28,
          distanceKm: 9.9,
        },
      },
    ],
  },
]

/** Delivery that keeps a light distance tick outside scripted beats */
const JITTER_DELIVERY_ID = 'NT-1008'

const TICK_MS = 4000

let currentDeliveries: Delivery[] = []
/** Snapshot restored at the start of each scenario loop */
let baselineDeliveries: Delivery[] = []
let liveTimer: ReturnType<typeof setTimeout> | null = null
let failNextRequest = false

let activeScript: ScenarioScript = SCENARIO_SCRIPTS[0]!
let cycleStartedAt = 0
let lastCycleIndex = -1
/** Accumulated distance for the jitter route (survives script re-derive) */
let jitterDistanceKm = 9.6

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

function stampNow(deliveries: Omit<Delivery, 'lastUpdated'>[]): Delivery[] {
  const now = Date.now()
  return deliveries.map((d, index) => ({
    ...d,
    lastUpdated: new Date(now - index * 15_000).toISOString(),
  }))
}

function cloneDeliveries(deliveries: Delivery[]): Delivery[] {
  return deliveries.map((d) => ({ ...d }))
}

function applyPatch(delivery: Delivery, patch: DeliveryPatch): Delivery {
  return {
    ...delivery,
    ...patch,
  }
}

function applyEventsUpTo(
  deliveries: Delivery[],
  script: ScenarioScript,
  atOrBeforeSecond: number,
): Delivery[] {
  let next = cloneDeliveries(deliveries)
  const due = script.events
    .filter((event) => event.atSecond <= atOrBeforeSecond)
    .sort((a, b) => a.atSecond - b.atSecond)

  for (const event of due) {
    next = next.map((delivery) =>
      delivery.id === event.deliveryId
        ? applyPatch(delivery, event.patch)
        : delivery,
    )
  }
  return next
}

function sameOpsFields(a: Delivery, b: Delivery): boolean {
  return (
    a.status === b.status &&
    a.reason === b.reason &&
    a.etaMinutes === b.etaMinutes &&
    a.distanceKm === b.distanceKm
  )
}

/**
 * Merge freshly derived script state with the previous frame so
 * lastUpdated (and Signal Ping) only change when ops fields change.
 */
function reconcileWithPrevious(
  derived: Delivery[],
  previous: Delivery[],
): Delivery[] {
  const prevById = new Map(previous.map((d) => [d.id, d] as const))
  const now = new Date().toISOString()

  return derived.map((delivery) => {
    const prev = prevById.get(delivery.id)
    if (prev && sameOpsFields(prev, delivery)) {
      return { ...delivery, lastUpdated: prev.lastUpdated }
    }
    return { ...delivery, lastUpdated: now }
  })
}

function applyLightJitter(deliveries: Delivery[]): Delivery[] {
  return deliveries.map((delivery) => {
    if (delivery.id !== JITTER_DELIVERY_ID) return delivery
    if (delivery.status === 'pending') return delivery

    jitterDistanceKm = Math.max(
      0.4,
      round(jitterDistanceKm - randomBetween(0.15, 0.55)),
    )

    return {
      ...delivery,
      distanceKm: jitterDistanceKm,
      etaMinutes: Math.max(1, Math.round(jitterDistanceKm * 2.8)),
    }
  })
}

function pickScript(): ScenarioScript {
  const index = Math.floor(Math.random() * SCENARIO_SCRIPTS.length)
  return SCENARIO_SCRIPTS[index]!
}

function resetJitterFromBaseline(): void {
  const seed = baselineDeliveries.find((d) => d.id === JITTER_DELIVERY_ID)
  jitterDistanceKm = seed?.distanceKm ?? 9.6
}

/**
 * Mock logistics API — async delays, rare failures, and a scenario-directed live feed.
 */
export const mockTransitService = {
  failNext(): void {
    failNextRequest = true
  },

  async getDeliveries(): Promise<Delivery[]> {
    await delay(randomBetween(400, 800))

    if (failNextRequest || Math.random() < 0.05) {
      failNextRequest = false
      throw new Error('Network request failed: unable to reach transit API')
    }

    baselineDeliveries = stampNow(SEED_DELIVERIES)
    currentDeliveries = cloneDeliveries(baselineDeliveries)
    activeScript = pickScript()
    cycleStartedAt = 0
    lastCycleIndex = -1
    resetJitterFromBaseline()

    return cloneDeliveries(currentDeliveries)
  },

  /**
   * Steps the active scenario script on each tick, loops forever,
   * and keeps one delivery on a light distance jitter.
   */
  startLiveUpdates(callback: (deliveries: Delivery[]) => void): () => void {
    const clear = () => {
      if (liveTimer !== null) {
        clearTimeout(liveTimer)
        liveTimer = null
      }
    }

    clear()
    cycleStartedAt = Date.now()
    lastCycleIndex = -1

    const tick = () => {
      if (currentDeliveries.length === 0 || baselineDeliveries.length === 0) {
        liveTimer = setTimeout(tick, TICK_MS)
        return
      }

      const elapsedSec = (Date.now() - cycleStartedAt) / 1000
      const duration = activeScript.durationSeconds
      const cycleIndex = Math.floor(elapsedSec / duration)
      const cycleSecond = elapsedSec % duration

      if (cycleIndex !== lastCycleIndex) {
        resetJitterFromBaseline()
        lastCycleIndex = cycleIndex
      }

      const scripted = applyEventsUpTo(
        baselineDeliveries,
        activeScript,
        cycleSecond,
      )
      const withJitter = applyLightJitter(scripted)
      currentDeliveries = reconcileWithPrevious(withJitter, currentDeliveries)

      callback(cloneDeliveries(currentDeliveries))
      liveTimer = setTimeout(tick, TICK_MS)
    }

    liveTimer = setTimeout(tick, TICK_MS)
    return clear
  },

  getActiveScript(): ScenarioScript {
    return activeScript
  },
}
