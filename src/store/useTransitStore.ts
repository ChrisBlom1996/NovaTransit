import { create } from 'zustand'
import { mockTransitService } from '../services/mockTransitService'
import type { Delivery } from '../types'
import {
  matchesFilters,
  type SortBy,
  type StatusFilter,
} from './transitSelectors'

type TransitState = {
  deliveries: Delivery[]
  loading: boolean
  error: string | null
  pingingIds: string[]
  selectedId: string | null
  sortBy: SortBy
  statusFilter: StatusFilter
  searchQuery: string
  fetchDeliveries: () => Promise<boolean>
  startLiveUpdates: () => void
  stopLiveUpdates: () => void
  clearPing: (id: string) => void
  selectDelivery: (id: string | null) => void
  setSortBy: (sortBy: SortBy) => void
  setStatusFilter: (statusFilter: StatusFilter) => void
  setSearchQuery: (searchQuery: string) => void
}

let stopLive: (() => void) | null = null

function clearSelectionIfHidden(
  deliveries: Delivery[],
  selectedId: string | null,
  statusFilter: StatusFilter,
  searchQuery: string,
): string | null {
  if (!selectedId) return null
  const selected = deliveries.find((d) => d.id === selectedId)
  if (!selected) return null
  return matchesFilters(selected, statusFilter, searchQuery) ? selectedId : null
}

export const useTransitStore = create<TransitState>((set, get) => ({
  deliveries: [],
  loading: false,
  error: null,
  pingingIds: [],
  selectedId: null,
  sortBy: 'eta',
  statusFilter: 'all',
  searchQuery: '',

  fetchDeliveries: async () => {
    set({ loading: true, error: null, pingingIds: [], selectedId: null })
    try {
      const deliveries = await mockTransitService.getDeliveries()
      set({ deliveries, loading: false, error: null })
      return true
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load deliveries'
      set({ loading: false, error: message, deliveries: [], selectedId: null })
      return false
    }
  },

  startLiveUpdates: () => {
    get().stopLiveUpdates()
    stopLive = mockTransitService.startLiveUpdates((deliveries) => {
      const prevById = new Map(
        get().deliveries.map((d) => [d.id, d] as const),
      )
      const pingingIds = deliveries
        .filter((d) => {
          const prev = prevById.get(d.id)
          return prev !== undefined && prev.lastUpdated !== d.lastUpdated
        })
        .map((d) => d.id)

      const { statusFilter, searchQuery, selectedId } = get()
      set({
        deliveries,
        error: null,
        pingingIds: [...new Set([...get().pingingIds, ...pingingIds])],
        selectedId: clearSelectionIfHidden(
          deliveries,
          selectedId,
          statusFilter,
          searchQuery,
        ),
      })
    })
  },

  stopLiveUpdates: () => {
    stopLive?.()
    stopLive = null
  },

  clearPing: (id) => {
    set((state) => ({
      pingingIds: state.pingingIds.filter((pingId) => pingId !== id),
    }))
  },

  selectDelivery: (id) => {
    set((state) => ({
      selectedId: state.selectedId === id ? null : id,
    }))
  },

  setSortBy: (sortBy) => set({ sortBy }),

  setStatusFilter: (statusFilter) => {
    const { deliveries, searchQuery, selectedId } = get()
    set({
      statusFilter,
      selectedId: clearSelectionIfHidden(
        deliveries,
        selectedId,
        statusFilter,
        searchQuery,
      ),
    })
  },

  setSearchQuery: (searchQuery) => {
    const { deliveries, statusFilter, selectedId } = get()
    set({
      searchQuery,
      selectedId: clearSelectionIfHidden(
        deliveries,
        selectedId,
        statusFilter,
        searchQuery,
      ),
    })
  },
}))

export {
  selectVisibleDeliveries,
  selectMatchingIds,
  matchesFilters,
} from './transitSelectors'
export type { SortBy, StatusFilter } from './transitSelectors'
