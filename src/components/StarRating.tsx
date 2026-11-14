import { Star } from 'lucide-react'
import { useRef, type KeyboardEvent, type MouseEvent } from 'react'

interface Props {
  value?: number
  onChange: (value: number | undefined) => void
  label: string
}

/** 0.5–5 stars. Tap the left half of a star for a half star; tap the current value again to clear. Arrow keys step by 0.5. */
export function StarRating({ value, onChange, label }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const pick = (e: MouseEvent<HTMLButtonElement>, i: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const half = e.clientX - rect.left < rect.width / 2
    const next = i + (half ? 0.5 : 1)
    onChange(next === value ? undefined : next)
  }
  const onKey = (e: KeyboardEvent) => {
    const cur = value ?? 0
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(5, cur + 0.5))
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(cur - 0.5 >= 0.5 ? cur - 0.5 : undefined)
    else if (e.key === 'Backspace' || e.key === 'Delete') onChange(undefined)
    else return
    e.preventDefault()
  }

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value}
      aria-valuetext={value ? `${value} out of 5 stars` : 'Not rated'}
      onKeyDown={onKey}
      className="inline-flex rounded-lg"
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, (value ?? 0) - i))
        return (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={(e) => pick(e, i)}
            className="relative grid h-11 w-11 place-items-center text-muted"
          >
            <Star size={26} strokeWidth={1.6} />
            <span className="absolute inset-0 grid place-items-center overflow-hidden text-accent" style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}>
              <Star size={26} strokeWidth={1.6} fill="currentColor" />
            </span>
          </button>
        )
      })}
    </div>
  )
}
