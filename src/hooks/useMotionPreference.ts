import { useReducedMotion } from 'framer-motion'

/** Prefer Framer's hook so motion components and UI stay in sync. */
export function useMotionPreference() {
  const reduced = useReducedMotion()
  return { reduceMotion: !!reduced }
}
