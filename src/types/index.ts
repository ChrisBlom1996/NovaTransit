export type DeliveryStatus = 'pending' | 'en_route' | 'delayed'

export type Delivery = {
  id: string
  destination: string
  distanceKm: number
  etaMinutes: number
  status: DeliveryStatus
  /** Ops note — e.g. traffic, dwell, break. Null when nothing notable. */
  reason: string | null
  lat: number
  lng: number
  lastUpdated: string
}
