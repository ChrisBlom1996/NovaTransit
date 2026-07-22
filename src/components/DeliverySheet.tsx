import { motion, type PanInfo } from 'framer-motion'
import { useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMotionPreference } from '../hooks/useMotionPreference'
import {
  selectVisibleDeliveries,
  useTransitStore,
} from '../store/useTransitStore'
import { DeliveryCard, DeliveryCardSkeleton } from './DeliveryCard'
import { FeedControls } from './FeedControls'

type SheetSnap = 'collapsed' | 'expanded'

/** Pixel peeks — % height alone can collapse to 0 if measured before parent layout */
const SNAP_HEIGHT_PX: Record<SheetSnap, number> = {
  collapsed: 340,
  expanded: 580,
}

type DeliverySheetProps = {
  snap: SheetSnap
  onSnapChange: (snap: SheetSnap) => void
}

export function DeliverySheet({ snap, onSnapChange }: DeliverySheetProps) {
  const { reduceMotion } = useMotionPreference()
  const loading = useTransitStore((s) => s.loading)
  const totalCount = useTransitStore((s) => s.deliveries.length)
  const selectedId = useTransitStore((s) => s.selectedId)
  const selectDelivery = useTransitStore((s) => s.selectDelivery)
  const visibleDeliveries = useTransitStore(
    useShallow(selectVisibleDeliveries),
  )
  const didDragRef = useRef(false)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Dragging the handle up expands; down collapses
    if (info.offset.y < -40 || info.velocity.y < -300) {
      onSnapChange('expanded')
    } else if (info.offset.y > 40 || info.velocity.y > 300) {
      onSnapChange('collapsed')
    }
  }

  const toggleSnap = () => {
    if (didDragRef.current) return
    onSnapChange(snap === 'expanded' ? 'collapsed' : 'expanded')
  }

  return (
    <motion.section
      className="
        absolute inset-x-0 bottom-0 z-50 flex max-h-[85%] flex-col overflow-hidden
        rounded-t-[1.35rem] border border-border border-b-0
        bg-[color-mix(in_srgb,var(--bg)_92%,transparent)]
        shadow-[0_-16px_48px_rgba(0,0,0,0.65)]
        backdrop-blur-2xl
      "
      initial={false}
      animate={{ height: SNAP_HEIGHT_PX[snap] }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 380, damping: 36 }
      }
      aria-label="Delivery feed"
    >
      {/*
        Drag handle — pointer events must reach this button.
        Do NOT stopPropagation on the section in the capture phase;
        that blocked Framer drag listeners on this handle.
        Sheet sits above the map (z-50), so map won't receive these touches anyway.
      */}
      <motion.button
        type="button"
        className="
          flex shrink-0 cursor-grab flex-col items-center
          active:cursor-grabbing touch-none select-none
          px-4 pb-2 pt-2.5
        "
        aria-label={snap === 'expanded' ? 'Collapse panel' : 'Expand panel'}
        onTap={toggleSnap}
        drag={reduceMotion ? false : 'y'}
        dragConstraints={{ top: -120, bottom: 80 }}
        dragElastic={0.18}
        dragMomentum={false}
        dragSnapToOrigin
        onDragStart={() => {
          didDragRef.current = true
        }}
        onDragEnd={(event, info) => {
          handleDragEnd(event, info)
          // Allow a beat so onTap from the same gesture is ignored
          window.setTimeout(() => {
            didDragRef.current = false
          }, 50)
        }}
      >
        <span className="h-1.5 w-11 rounded-full bg-white/35" />
        <div className="mt-2.5 flex w-full items-center justify-between">
          <h2 className="font-label text-sm font-semibold tracking-tight text-text-primary">
            Active routes
          </h2>
          <span className="font-mono text-xs text-text-muted">
            {loading
              ? '—'
              : visibleDeliveries.length === totalCount
                ? totalCount
                : `${visibleDeliveries.length}/${totalCount}`}
          </span>
        </div>
      </motion.button>

      <FeedControls />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-2 [touch-action:pan-y]">
        <ul className="flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 5 }, (_, i) => (
              <li key={`sk-${i}`}>
                <DeliveryCardSkeleton />
              </li>
            ))
          ) : visibleDeliveries.length === 0 ? (
            <li className="px-1 py-6 text-center text-sm text-text-muted">
              No deliveries match these filters.
            </li>
          ) : (
            visibleDeliveries.map((delivery) => (
              <li key={delivery.id}>
                <DeliveryCard
                  delivery={delivery}
                  selected={selectedId === delivery.id}
                  onSelect={() => selectDelivery(delivery.id)}
                />
              </li>
            ))
          )}
        </ul>
      </div>
    </motion.section>
  )
}
