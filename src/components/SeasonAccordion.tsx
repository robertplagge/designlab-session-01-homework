import { Check, ChevronDown } from 'lucide-react'
import { formatDate } from '../lib/dates'
import { airedEpisodes, firstWatch, hasAired, keyOf, type EpisodeRef, type SeasonEpisodes } from '../lib/logic/episodes'
import type { EpisodeWatch, SeasonRating } from '../lib/types'
import { useLongPress } from '../lib/useLongPress'
import { OverflowMenu } from './OverflowMenu'
import { StarRating } from './StarRating'

interface Props {
  seasons: SeasonEpisodes[]
  watches: EpisodeWatch[]
  seasonRatings: SeasonRating[]
  openSeason: number | null
  onOpen: (season: number | null) => void
  onTapEpisode: (ref: EpisodeRef & { name: string }) => void
  onUpTo: (ref: EpisodeRef & { name: string }) => void
  onRemove: (ref: EpisodeRef & { name: string }) => void
  onMarkSeason: (season: number) => void
  onRateSeason: (season: number, rating: number | undefined) => void
}

export function SeasonAccordion(p: Props) {
  const watchedKeys = new Set(p.watches.map((w) => keyOf(w.season, w.episode)))
  return (
    <div className="flex flex-col gap-2">
      {p.seasons
        .filter((s) => s.season > 0)
        .map((s) => {
          const aired = airedEpisodes([s])
          const done = aired.filter((e) => watchedKeys.has(keyOf(s.season, e.episode))).length
          const complete = aired.length > 0 && done === aired.length
          const open = p.openSeason === s.season
          const rating = p.seasonRatings.find((r) => r.season === s.season)?.rating
          const panel = `season-${s.season}`
          return (
            <section key={s.season} className="rounded-2xl border border-line bg-surface">
              <div className="flex items-center pr-1">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panel}
                  onClick={() => p.onOpen(open ? null : s.season)}
                  className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl px-4 text-left"
                >
                  <span className="flex-1">
                    <span className="block font-semibold">Season {s.season}</span>
                    <span className="mt-1 block h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                      <span className="block h-full rounded-full bg-accent transition-[width]" style={{ width: `${aired.length ? (done / aired.length) * 100 : 0}%` }} />
                    </span>
                  </span>
                  <span className={`flex items-center gap-1 text-sm ${complete ? 'text-accent' : 'text-muted'}`}>
                    {complete && <Check size={14} strokeWidth={3} aria-hidden />}
                    {done}/{aired.length}
                  </span>
                  <ChevronDown size={18} aria-hidden className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                <OverflowMenu label={`Season ${s.season} actions`} items={[{ label: 'Mark season watched', onSelect: () => p.onMarkSeason(s.season) }]} />
              </div>

              {open && (
                <div id={panel} className="border-t border-line px-2 pb-3 pt-1">
                  <ul>
                    {s.episodes.map((ep) => {
                      const ref = { season: s.season, episode: ep.episode, name: ep.name }
                      const wl = firstWatch(p.watches, s.season, ep.episode)
                      const rewatches = p.watches.filter((w) => w.season === s.season && w.episode === ep.episode && w.isRewatch).length
                      return (
                        <EpisodeRow
                          key={ep.episode}
                          ep={ep}
                          watchedAt={wl?.watchedAt}
                          rewatches={rewatches}
                          onTap={() => p.onTapEpisode(ref)}
                          onUpTo={() => p.onUpTo(ref)}
                          onRemove={() => p.onRemove(ref)}
                        />
                      )
                    })}
                  </ul>
                  <div className="mt-2 border-t border-line px-2 pt-3">
                    <p className="mb-1 text-xs font-medium text-muted">Rate this season (optional)</p>
                    <StarRating label={`Rate season ${s.season}`} value={rating} onChange={(r) => p.onRateSeason(s.season, r)} />
                  </div>
                </div>
              )}
            </section>
          )
        })}
    </div>
  )
}

interface RowProps {
  ep: { episode: number; name: string; airDate?: string }
  watchedAt?: string
  rewatches: number
  onTap: () => void
  onUpTo: () => void
  onRemove: () => void
}

function EpisodeRow({ ep, watchedAt, rewatches, onTap, onUpTo, onRemove }: RowProps) {
  const watched = !!watchedAt
  const aired = hasAired(ep)
  const lp = useLongPress(onUpTo)
  const { consumeClick, ...handlers } = lp
  const sub = !aired
    ? `Airs ${formatDate(ep.airDate)}`
    : watched
      ? `Watched ${formatDate(watchedAt)}${rewatches ? ` · ${rewatches} rewatch${rewatches > 1 ? 'es' : ''}` : ''}`
      : ep.airDate
        ? formatDate(ep.airDate)
        : ''
  return (
    <li className="flex items-center">
      <button
        type="button"
        disabled={!aired}
        aria-pressed={watched}
        aria-label={`Episode ${ep.episode}, ${ep.name}${watched ? ', watched' : ''}${!aired ? ', not aired yet' : ''}`}
        {...handlers}
        onClick={() => {
          if (consumeClick()) return
          onTap()
        }}
        className="flex min-h-14 flex-1 select-none items-center gap-3 rounded-xl px-2 text-left hover:bg-surface-2 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${watched ? 'anim-pop border-accent bg-accent text-accent-ink' : 'border-line'}`}>
          {watched && <Check size={16} strokeWidth={3.5} aria-hidden />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.95rem]">
            <span className="mr-2 text-muted tabular-nums">{ep.episode}</span>
            {ep.name}
          </span>
          {sub && <span className={`block text-xs ${watched ? 'text-accent' : 'text-muted'}`}>{sub}</span>}
        </span>
      </button>
      {aired && (
        <OverflowMenu
          label={`Episode ${ep.episode} actions`}
          items={[
            { label: 'Watched up to here', onSelect: onUpTo },
            ...(watched ? [{ label: 'Remove from history', onSelect: onRemove, danger: true }] : []),
          ]}
        />
      )}
    </li>
  )
}
