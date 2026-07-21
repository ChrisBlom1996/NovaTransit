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

/**
 * Pill styles tuned for WCAG AA on dark surface/card (~4.5:1+).
 * Token hues stay for pins; pill text is slightly lifted for small type.
 */
export function statusPillClass(status: DeliveryStatus): string {
  switch (status) {
    case 'pending':
      return 'border border-accent-amber/40 bg-accent-amber/10 text-[#FFC34D]'
    case 'en_route':
      return 'border border-accent-steel/45 bg-accent-steel/10 text-[#8FC0E8]'
    case 'delayed':
      return 'border border-danger/40 bg-danger/10 text-[#FF8A90]'
  }
}
