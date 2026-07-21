import { motion } from 'framer-motion'

const BARS = [0.45, 0.85, 0.55, 1, 0.65] as const

export function LiveBadge() {
  return (
    <div
      className="
        pointer-events-none absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2
        items-center gap-2 rounded-full border border-border bg-bg/85
        px-3 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md
        min-[500px]:top-12
      "
      aria-live="polite"
    >
      <span className="font-label text-[11px] font-semibold tracking-[0.08em] text-accent-amber">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent-amber" />
        LIVE
      </span>
      <div className="flex h-3 items-end gap-[2px]" aria-hidden>
        {BARS.map((peak, index) => (
          <motion.span
            key={index}
            className="w-[2px] rounded-full bg-accent-amber"
            animate={{ scaleY: [0.35, peak, 0.4, peak * 0.85, 0.35] }}
            transition={{
              duration: 1.1 + index * 0.08,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.07,
            }}
            style={{ height: 12, originY: 1 }}
          />
        ))}
      </div>
    </div>
  )
}
