import { create } from 'zustand'
import { mockTransitService } from '../services/mockTransitService'
import type { Delivery } from '../types'

type TransitState = {
  deliveries: Delivery[]
  loading: boolean
  error: string | null
  /** Delivery IDs that just received a live update — drive Signal Ping on the map */
  pingingIds: string[]
  selectedId: string | null
  fetchDeliveries: () => Promise<boolean>
  startLiveUpdates: () => void
  stopLiveUpdates: () => void
  clearPing: (id: string) => void
  selectDelivery: (id: string | null) => void
}

let stopLive: (() => void) | null = null

export const useTransitStore = create<TransitState>((set, get) => ({
  deliveries: [],
  loading: false,
  error: null,
  pingingIds: [],
  selectedId: null,

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

      set({
        deliveries,
        error: null,
        pingingIds: [...new Set([...get().pingingIds, ...pingingIds])],
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
}))
