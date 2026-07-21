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

export function statusLabel(status: DeliveryStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'en_route':
      return 'En route'
    case 'delayed':
      return 'Delayed'
  }
}

/** Tailwind text/bg utility pair for status pills */
export function statusPillClass(status: DeliveryStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-accent-amber/15 text-accent-amber'
    case 'en_route':
      return 'bg-accent-steel/15 text-accent-steel'
    case 'delayed':
      return 'bg-danger/15 text-danger'
  }
}
