import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { statusColorHex } from '../services/statusColor'
import type { DeliveryStatus } from '../types'

type DeliveryPinProps = {
  color: string
  pinging?: boolean
  onPingComplete?: () => void
  skeleton?: boolean
}

export function DeliveryPin({
  color,
  pinging = false,
  onPingComplete,
  skeleton = false,
}: DeliveryPinProps) {
  useEffect(() => {
    if (!pinging || !onPingComplete) return
    const timer = window.setTimeout(onPingComplete, 820)
    return () => window.clearTimeout(timer)
  }, [pinging, onPingComplete])

  if (skeleton) {
    return (
      <span className="relative block h-3 w-3">
        <span className="absolute inset-0 animate-pulse rounded-full bg-white/25" />
        <span className="absolute -inset-1 animate-pulse rounded-full bg-white/10" />
      </span>
    )
  }

  return (
    <span className="relative block h-3 w-3">
      {pinging ? (
        <motion.span
          key="signal-ping"
          className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ scale: 1, opacity: 0.45 }}
          animate={{ scale: 3.4, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ) : null}
      <span
        className="absolute inset-0 rounded-full shadow-[0_0_0_1.5px_rgba(10,14,18,0.85)]"
        style={{ backgroundColor: color }}
      />
    </span>
  )
}

export function pinColorForStatus(status: DeliveryStatus): string {
  return statusColorHex(status)
}
