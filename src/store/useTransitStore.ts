import { create } from 'zustand'
import { mockTransitService } from '../services/mockTransitService'
import type { Delivery } from '../types'

type TransitState = {
  deliveries: Delivery[]
  loading: boolean
  error: string | null
  fetchDeliveries: () => Promise<void>
  startLiveUpdates: () => void
  stopLiveUpdates: () => void
}

let stopLive: (() => void) | null = null

export const useTransitStore = create<TransitState>((set, get) => ({
  deliveries: [],
  loading: false,
  error: null,

  fetchDeliveries: async () => {
    set({ loading: true, error: null })
    try {
      const deliveries = await mockTransitService.getDeliveries()
      set({ deliveries, loading: false, error: null })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load deliveries'
      set({ loading: false, error: message })
    }
  },

  startLiveUpdates: () => {
    get().stopLiveUpdates()
    stopLive = mockTransitService.startLiveUpdates((deliveries) => {
      set({ deliveries, error: null })
    })
  },

  stopLiveUpdates: () => {
    stopLive?.()
    stopLive = null
  },
}))
