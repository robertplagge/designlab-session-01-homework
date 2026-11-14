import { Film, Tv } from 'lucide-react'
import type { MediaType } from '../lib/types'

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

interface Props {
  name: string
  type: MediaType
  posterPath?: string
  className?: string
}

/** Real poster when we have a path; otherwise a calm generated gradient so the layout stays poster-led. */
export function Poster({ name, type, posterPath, className = '' }: Props) {
  if (posterPath) {
    return (
      <img
        src={`https://image.tmdb.org/t/p/w342${posterPath}`}
        alt=""
        loading="lazy"
        className={`aspect-[2/3] rounded-lg bg-surface-2 object-cover ${className}`}
      />
    )
  }
  const h = hash(name) % 360
  const Icon = type === 'movie' ? Film : Tv
  return (
    <div
      aria-hidden
      className={`relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-lg p-2 text-white ${className}`}
      style={{ background: `linear-gradient(160deg, hsl(${h} 38% 30%), hsl(${(h + 40) % 360} 45% 14%))` }}
    >
      <Icon size={14} className="opacity-70" />
      <span className="line-clamp-4 text-[0.7rem] font-semibold leading-tight tracking-wide opacity-90">{name}</span>
    </div>
  )
}
