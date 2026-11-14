import { useId } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  invalid?: boolean
}

export function TimeInput({ value, onChange, invalid }: Props) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        Stopped at (h:mm)
      </label>
      <input
        id={id}
        inputMode="numeric"
        placeholder="1:12"
        value={value}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-11 w-28 rounded-xl border bg-surface px-3 text-base ${invalid ? 'border-danger' : 'border-line'}`}
      />
    </div>
  )
}
