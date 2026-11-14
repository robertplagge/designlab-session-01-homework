import { Undo2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastInput } from './useToast'

interface ToastItem extends ToastInput {
  key: number
}

const DURATION = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const counter = useRef(0)

  const dismiss = useCallback(() => setToast(null), [])
  const show = useCallback((t: ToastInput) => {
    window.clearTimeout(timer.current)
    setToast({ ...t, key: ++counter.current })
    timer.current = window.setTimeout(() => setToast(null), DURATION)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + var(--toast-extra, 0px) + 76px)' }}
      >
        {toast && (
          <div
            key={toast.key}
            className="anim-slide-up pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-2xl border border-line bg-surface-2 py-1.5 pl-4 pr-1.5 shadow-xl"
          >
            <span className="min-w-0 flex-1 truncate text-sm">{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                className="flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-accent hover:bg-accent-soft"
                onClick={async () => {
                  const u = toast.undo
                  dismiss()
                  await u?.()
                }}
              >
                <Undo2 size={16} aria-hidden /> Undo
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
