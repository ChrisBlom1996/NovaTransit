import type { DeliveryStatus } from '../types'

/** Status → CSS color token (hex), for map pins / ripples */
export function statusColor(status: DeliveryStatus): string {
  switch (status) {
    case 'pending':
      return 'var(--accent-amber)'
    case 'en_route':
      return 'var(--accent-steel)'
    case 'delayed':
      return 'var(--danger)'
  }
}

export function statusColorHex(status: DeliveryStatus): string {
  switch (status) {
    case 'pending':
      return '#FFB020'
    case 'en_route':
      return '#4C8CBF'
    case 'delayed':
      return '#F2545B'
  }
}
