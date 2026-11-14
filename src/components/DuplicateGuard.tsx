import { useEffect, useRef } from 'react'

interface Props {
  label: string // e.g. "S1 E3 · Gray Matter"
  watchedOn: string // formatted date
  onRewatch: () => void
  onRemove: () => void
  onCancel: () => void
}

/** Bottom sheet shown when marking an episode that's already watched. */
export function DuplicateGuard({ label, watchedOn, onRewatch, onRemove, onCancel }: Props) {
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    first.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="anim-fade-in absolute inset-0 bg-[var(--scrim)]" onClick={onCancel} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dup-title"
        className="anim-slide-up relative w-full max-w-2xl rounded-t-3xl border border-line bg-surface p-5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <h2 id="dup-title" className="text-lg font-semibold">
          You watched this on {watchedOn}
        </h2>
        <p className="mt-1 text-sm text-muted">{label}</p>
        <div className="mt-5 flex flex-col gap-2">
          <button ref={first} type="button" onClick={onRewatch} className="min-h-12 rounded-xl bg-accent font-semibold text-accent-ink">
            Log rewatch
          </button>
          <button type="button" onClick={onCancel} className="min-h-12 rounded-xl border border-line font-semibold hover:bg-surface-2">
            Cancel
          </button>
          <button type="button" onClick={onRemove} className="min-h-11 rounded-xl text-sm text-muted hover:text-danger">
            Remove from history
          </button>
        </div>
      </div>
    </div>
  )
}
