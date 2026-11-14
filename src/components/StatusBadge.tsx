import { Check } from 'lucide-react'
import type { Badge } from '../lib/logic/badge'

const tone = {
  accent: 'bg-accent-soft text-accent',
  neutral: 'bg-surface-2 text-fg',
  muted: 'bg-surface-2 text-muted',
}

export function StatusBadge({ badge, className = '' }: { badge: Badge | null; className?: string }) {
  if (!badge) return null
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tone[badge.tone]} ${className}`}>
      {badge.tone === 'accent' && <Check size={12} aria-hidden strokeWidth={3} />}
      {badge.text}
    </span>
  )
}
