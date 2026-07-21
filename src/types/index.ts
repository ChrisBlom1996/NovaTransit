export type DeliveryStatus = 'pending' | 'en_route' | 'delayed'

export type Delivery = {
  id: string
  destination: string
  distanceKm: number
  etaMinutes: number
  status: DeliveryStatus
  lat: number
  lng: number
  lastUpdated: string
}
