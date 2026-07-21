import { motion, type PanInfo } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
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
  const loading = useTransitStore((s) => s.loading)
  const totalCount = useTransitStore((s) => s.deliveries.length)
  const selectedId = useTransitStore((s) => s.selectedId)
  const selectDelivery = useTransitStore((s) => s.selectDelivery)
  const visibleDeliveries = useTransitStore(
    useShallow(selectVisibleDeliveries),
  )

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -48 || info.velocity.y < -400) {
      onSnapChange('expanded')
      return
    }
    if (info.offset.y > 48 || info.velocity.y > 400) {
      onSnapChange('collapsed')
    }
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
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      aria-label="Delivery feed"
    >
      {/* Drag handle — always visible in peeked state */}
      <motion.button
        type="button"
        className="flex shrink-0 cursor-grab flex-col items-center active:cursor-grabbing touch-none px-4 pb-2 pt-2.5"
        aria-label={snap === 'expanded' ? 'Collapse panel' : 'Expand panel'}
        onClick={() =>
          onSnapChange(snap === 'expanded' ? 'collapsed' : 'expanded')
        }
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.12}
        onDragEnd={handleDragEnd}
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-2">
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
