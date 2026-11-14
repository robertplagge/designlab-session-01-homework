import { useEffect, useState, type ReactNode } from 'react'

/** Two-step inline confirmation for destructive actions (no modal). */
export function ConfirmButton({ children, confirmLabel, onConfirm, className = '' }: { children: ReactNode; confirmLabel: string; onConfirm: () => void; className?: string }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = window.setTimeout(() => setArmed(false), 5000)
    return () => window.clearTimeout(t)
  }, [armed])
  return armed ? (
    <span className="flex gap-2">
      <button type="button" onClick={() => { setArmed(false); onConfirm() }} className={`min-h-11 rounded-full bg-danger px-4 text-sm font-semibold text-bg ${className}`}>
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setArmed(false)} className="min-h-11 rounded-full px-4 text-sm text-muted hover:bg-surface-2">
        Cancel
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className={`min-h-11 rounded-full border border-line px-4 text-sm font-medium text-danger hover:bg-surface-2 ${className}`}>
      {children}
    </button>
  )
}
