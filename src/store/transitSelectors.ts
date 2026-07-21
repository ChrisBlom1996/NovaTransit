import type { Delivery, DeliveryStatus } from '../types'

export type SortBy = 'eta' | 'distance'

export type StatusFilter = 'all' | DeliveryStatus

export type TransitFilterState = {
  deliveries: Delivery[]
  sortBy: SortBy
  statusFilter: StatusFilter
  searchQuery: string
}

/** Shared match rule — list visibility and map pin dimming both use this */
export function matchesFilters(
  delivery: Delivery,
  statusFilter: StatusFilter,
  searchQuery: string,
): boolean {
  if (statusFilter !== 'all' && delivery.status !== statusFilter) {
    return false
  }

  const query = searchQuery.trim().toLowerCase()
  if (query.length > 0 && !delivery.destination.toLowerCase().includes(query)) {
    return false
  }

  return true
}

export function sortDeliveries(
  deliveries: Delivery[],
  sortBy: SortBy,
): Delivery[] {
  const sorted = [...deliveries]
  if (sortBy === 'eta') {
    sorted.sort((a, b) => a.etaMinutes - b.etaMinutes)
  } else {
    sorted.sort((a, b) => a.distanceKm - b.distanceKm)
  }
  return sorted
}

/** Sorted + filtered list for the sheet */
export function selectVisibleDeliveries(
  state: TransitFilterState,
): Delivery[] {
  const filtered = state.deliveries.filter((delivery) =>
    matchesFilters(delivery, state.statusFilter, state.searchQuery),
  )
  return sortDeliveries(filtered, state.sortBy)
}

/** IDs that pass filter/search — map dims anything not in this list */
export function selectMatchingIds(state: TransitFilterState): string[] {
  return state.deliveries
    .filter((delivery) =>
      matchesFilters(delivery, state.statusFilter, state.searchQuery),
    )
    .map((delivery) => delivery.id)
}
