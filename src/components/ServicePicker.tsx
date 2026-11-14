import { SERVICES } from '../lib/types'

interface Props {
  value?: string
  suggestions?: string[]
  onChange: (v: string | undefined) => void
}

export function ServicePicker({ value, suggestions = [], onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-muted">Watching on…</legend>
      <div className="flex flex-wrap gap-2">
        {SERVICES.map((s) => {
          const selected = value === s
          const suggested = suggestions.includes(s)
          return (
            <button
              key={s}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : s)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium ${selected ? 'border-accent bg-accent-soft text-accent' : 'border-line text-fg hover:bg-surface-2'}`}
            >
              {s}
              {suggested && !selected && <span className="ml-1.5 text-xs text-muted">· available</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
