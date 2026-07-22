import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { useMotionPreference } from '../hooks/useMotionPreference'
import {
  statusColorHex,
  statusLabel,
  statusPillClass,
} from '../services/statusColor'
import type { Delivery } from '../types'

type FlashValueProps = {
  value: string | number
  className?: string
  children: ReactNode
}

/** Brief highlight when a live-updated numeric/status value changes */
function FlashValue({ value, className, children }: FlashValueProps) {
  const { reduceMotion } = useMotionPreference()
  const prev = useRef(value)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (prev.current === value) return
    prev.current = value
    if (reduceMotion) return
    setFlash(true)
    const timer = window.setTimeout(() => setFlash(false), 700)
    return () => window.clearTimeout(timer)
  }, [value, reduceMotion])

  if (reduceMotion) {
    return <span className={className}>{children}</span>
  }

  return (
    <motion.span
      className={clsx('rounded-sm px-0.5 -mx-0.5', className)}
      animate={
        flash
          ? {
              backgroundColor: [
                'rgba(76, 140, 191, 0)',
                'rgba(76, 140, 191, 0.35)',
                'rgba(76, 140, 191, 0)',
              ],
            }
          : { backgroundColor: 'rgba(76, 140, 191, 0)' }
      }
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  )
}

type DeliveryCardProps = {
  delivery: Delivery
  selected: boolean
  onSelect: () => void
}

export function DeliveryCard({
  delivery,
  selected,
  onSelect,
}: DeliveryCardProps) {
  const accent = statusColorHex(delivery.status)
  const showReason =
    Boolean(delivery.reason) &&
    (delivery.status === 'delayed' || delivery.status === 'en_route')

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full rounded-lg border px-3.5 py-3 text-left transition-colors',
        selected
          ? 'border-accent-steel/50 bg-accent-steel/10'
          : 'border-border bg-white/[0.03] hover:bg-white/[0.05]',
      )}
      style={
        selected
          ? { boxShadow: `inset 3px 0 0 0 ${accent}` }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-label truncate text-sm font-medium text-text-primary">
            {delivery.destination}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-text-muted">
            {delivery.id}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <FlashValue value={delivery.status}>
            <span
              className={clsx(
                'label inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                statusPillClass(delivery.status),
              )}
            >
              {statusLabel(delivery.status)}
            </span>
          </FlashValue>
          {showReason ? (
            <FlashValue value={delivery.reason ?? ''}>
              <p className="max-w-[140px] text-right text-[11px] leading-snug text-text-muted">
                {delivery.reason}
              </p>
            </FlashValue>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-4">
        <div>
          <p className="label text-[10px] uppercase tracking-wider text-text-muted">
            Distance
          </p>
          <FlashValue
            value={delivery.distanceKm}
            className="font-mono text-sm text-text-primary"
          >
            {delivery.distanceKm.toFixed(1)} km
          </FlashValue>
        </div>
        <div>
          <p className="label text-[10px] uppercase tracking-wider text-text-muted">
            ETA
          </p>
          <FlashValue
            value={delivery.etaMinutes}
            className="font-mono text-sm text-text-primary"
          >
            {delivery.etaMinutes} min
          </FlashValue>
        </div>
      </div>
    </button>
  )
}

export function DeliveryCardSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-lg border border-border bg-white/[0.03] px-3.5 py-3">
      <div className="flex justify-between gap-3">
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-5 w-16 rounded-full bg-white/10" />
      </div>
      <div className="mt-3 flex gap-4">
        <div className="h-8 w-16 rounded bg-white/10" />
        <div className="h-8 w-14 rounded bg-white/10" />
      </div>
    </div>
  )
}
