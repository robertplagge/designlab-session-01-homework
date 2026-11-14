import { useRef, type PointerEvent } from 'react'

/** Long-press handler that also lets the caller suppress the click that follows. */
export function useLongPress(onLongPress: () => void, ms = 500) {
  const timer = useRef<number | undefined>(undefined)
  const fired = useRef(false)
  const origin = useRef<{ x: number; y: number } | null>(null)

  const cancel = () => window.clearTimeout(timer.current)
  return {
    onPointerDown: (e: PointerEvent) => {
      fired.current = false
      origin.current = { x: e.clientX, y: e.clientY }
      cancel()
      timer.current = window.setTimeout(() => {
        fired.current = true
        navigator.vibrate?.(12)
        onLongPress()
      }, ms)
    },
    onPointerMove: (e: PointerEvent) => {
      const o = origin.current
      if (o && Math.hypot(e.clientX - o.x, e.clientY - o.y) > 10) cancel()
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e: { preventDefault(): void }) => e.preventDefault(),
    /** Call at the start of onClick; returns true when the click was the tail of a long press. */
    consumeClick: () => {
      const was = fired.current
      fired.current = false
      return was
    },
  }
}
