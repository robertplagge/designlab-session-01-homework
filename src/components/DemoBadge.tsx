import { metadata } from '../lib/metadata'

export function DemoBadge() {
  if (!metadata.isDemo) return null
  return (
    <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-wider text-muted">
      Demo data
    </span>
  )
}
