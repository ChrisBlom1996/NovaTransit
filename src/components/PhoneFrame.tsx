import type { ReactNode } from 'react'

type PhoneFrameProps = {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div
      className="
        flex h-full min-h-dvh w-full items-center justify-center overflow-auto bg-bg
        max-[499px]:block max-[499px]:min-h-dvh max-[499px]:overflow-hidden
        min-[500px]:p-8
      "
    >
      {/* Device shell — bezel/notch only on desktop-sized viewports */}
      <div
        className="
          relative flex h-full w-full flex-col overflow-hidden bg-bg
          max-[499px]:h-dvh max-[499px]:min-h-dvh max-[499px]:rounded-none
          max-[499px]:border-0 max-[499px]:shadow-none
          min-[500px]:h-[844px] min-[500px]:w-[390px] min-[500px]:shrink-0
          min-[500px]:rounded-[2.75rem] min-[500px]:border min-[500px]:border-border
          min-[500px]:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_50px_-12px_rgba(0,0,0,0.65)]
        "
      >
        <div
          aria-hidden
          className="
            pointer-events-none absolute left-1/2 top-3 z-20 hidden h-[28px] w-[110px]
            -translate-x-1/2 rounded-full bg-black/80
            min-[500px]:block
          "
        />

        <div className="relative z-10 h-full w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
