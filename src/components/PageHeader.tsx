import type { ReactNode } from 'react'
import { DemoBadge } from './DemoBadge'

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        {children}
        <DemoBadge />
      </div>
    </header>
  )
}
