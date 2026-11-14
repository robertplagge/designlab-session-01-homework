import type { ReactNode } from 'react'

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-3 px-2 py-16 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <h2 className="text-lg font-semibold">{title}</h2>
      {children && <p className="text-sm leading-relaxed text-muted">{children}</p>}
      {action}
    </div>
  )
}
