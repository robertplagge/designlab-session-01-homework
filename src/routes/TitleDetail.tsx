import { ArrowLeft, Bookmark, Check, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ConfirmButton } from '../components/ConfirmButton'
import { DemoBadge } from '../components/DemoBadge'
import { DuplicateGuard } from '../components/DuplicateGuard'
import { Poster } from '../components/Poster'
import { RatingEditor, RatingPrompt } from '../components/RatingBox'
import { SeasonAccordion } from '../components/SeasonAccordion'
import { ServicePicker } from '../components/ServicePicker'
import { StatusBadge } from '../components/StatusBadge'
import { TimeInput } from '../components/TimeInput'
import { useToast } from '../components/useToast'
import {
  addToWatchlist,
  deleteMovieWatch,
  logEpisodes,
  logMovie,
  markSeasonWatched,
  markWatchedUpTo,
  removeTitle,
  setService,
  setSeasonRating,
  setStatus,
  unwatchEpisode,
} from '../lib/actions'
import { formatDate, fromDateInput, toDateInput } from '../lib/dates'
import { useDetail, useEpisodeWatches, useMovieWatches, useSeasonRatings, useSeasons, useSettings, useTitle } from '../lib/hooks'
import { badgeFor } from '../lib/logic/badge'
import { firstWatch, nextEpisode, type EpisodeRef } from '../lib/logic/episodes'
import { suggestServices } from '../lib/logic/providers'
import { shouldPromptRating } from '../lib/logic/status'
import { formatHm, parseHm } from '../lib/logic/time'
import type { MediaType, TitleDetail } from '../lib/types'

type NamedRef = EpisodeRef & { name: string }

export default function TitleDetailPage() {
  const params = useParams()
  const type: MediaType = params.type === 'movie' ? 'movie' : 'tv'
  const tmdbId = Number(params.tmdbId)
  const navigate = useNavigate()
  const { region } = useSettings()
  const { data: detail, error, loading } = useDetail(type, tmdbId, region)

  // Keep the floating toast above the sticky action bar on this page.
  useEffect(() => {
    document.documentElement.style.setProperty('--toast-extra', '72px')
    return () => {
      document.documentElement.style.removeProperty('--toast-extra')
    }
  }, [])

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} className="-ml-2 flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-muted hover:text-fg">
          <ArrowLeft size={18} aria-hidden /> Back
        </button>
        <DemoBadge />
      </div>
      {loading && <p className="py-16 text-center text-sm text-muted">Loading…</p>}
      {error && <p role="alert" className="py-16 text-center text-sm text-danger">Couldn’t load this title. {error}</p>}
      {detail && (type === 'movie' ? <MovieView detail={detail} /> : <SeriesView detail={detail} />)}
    </>
  )
}

function Header({ detail, children }: { detail: TitleDetail; children?: React.ReactNode }) {
  return (
    <header className="mb-5 flex gap-4">
      <Poster name={detail.name} type={detail.type} posterPath={detail.posterPath} className="w-28 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <h1 className="text-xl font-bold leading-tight tracking-tight">{detail.name}</h1>
        <p className="text-sm text-muted">
          {detail.type === 'movie' ? 'Movie' : 'Series'}
          {detail.year ? ` · ${detail.year}` : ''}
          {detail.runtime ? ` · ${formatHm(detail.runtime)}` : ''}
          {detail.seasons ? ` · ${detail.seasons.filter((s) => s.season > 0).length} seasons` : ''}
        </p>
        {children}
      </div>
    </header>
  )
}

function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 z-20 px-4" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 64px + 8px)' }}>
      <div className="mx-auto flex max-w-2xl gap-2 rounded-2xl border border-line bg-surface/95 p-2 shadow-xl backdrop-blur">{children}</div>
    </div>
  )
}

const primary = 'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 font-semibold text-accent-ink active:scale-[0.98]'
const secondary = 'flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line px-4 font-semibold hover:bg-surface-2'

/* ------------------------------ Series ------------------------------ */

function SeriesView({ detail }: { detail: TitleDetail }) {
  const toast = useToast()
  const title = useTitle(detail.id)
  const watches = useEpisodeWatches(detail.id)
  const seasonRatings = useSeasonRatings(detail.id)
  const { data: seasons, loading } = useSeasons(detail)
  const [openOverride, setOpenOverride] = useState<number | null | undefined>(undefined)
  const [dup, setDup] = useState<NamedRef | null>(null)

  const next = useMemo(() => (seasons ? nextEpisode(seasons, watches) : null), [seasons, watches])
  const autoOpen = next?.season ?? seasons?.filter((s) => s.season > 0).at(-1)?.season ?? null
  const openSeason = openOverride === undefined ? autoOpen : openOverride
  const badge = badgeFor(title)

  if (loading || !seasons) return (<><Header detail={detail} /><p className="py-8 text-center text-sm text-muted">Loading episodes…</p></>)

  const label = (r: NamedRef) => `S${r.season} E${r.episode} · ${r.name}`

  async function logOne(r: NamedRef, rewatch = false) {
    const undo = await logEpisodes(detail, seasons!, [r], { rewatch })
    toast({ message: `${rewatch ? 'Rewatch logged · ' : 'Logged · '}${label(r)}`, undo })
  }
  const tapEpisode = (r: NamedRef) => (firstWatch(watches, r.season, r.episode) ? setDup(r) : logOne(r))
  async function upTo(r: NamedRef) {
    const undo = await markWatchedUpTo(detail, seasons!, r)
    toast({ message: `Marked everything up to ${label(r)}`, undo })
  }
  async function markSeason(season: number) {
    const undo = await markSeasonWatched(detail, seasons!, season)
    toast({ message: `Season ${season} marked watched`, undo })
  }
  async function remove(r: NamedRef) {
    const undo = await unwatchEpisode(detail.id, seasons!, r.season, r.episode)
    toast({ message: `Removed ${label(r)} from history`, undo })
  }
  async function resume() {
    const undo = watches.length ? await logEpisodes(detail, seasons!, []) : await setStatus(detail, 'watchlist')
    toast({ message: 'Moved back to your library', undo })
  }

  const dupWatch = dup ? firstWatch(watches, dup.season, dup.episode) : undefined

  return (
    <>
      <Header detail={detail}>
        <StatusBadge badge={badge} />
        {next && title && title.status !== 'watchlist' && <p className="text-sm font-medium">Next: {label(next)}</p>}
      </Header>

      {detail.overview && <p className="mb-5 text-sm leading-relaxed text-muted">{detail.overview}</p>}

      <div className="flex flex-col gap-6">
        {title && shouldPromptRating(title) && <RatingPrompt title={title} />}

        <SeasonAccordion
          seasons={seasons}
          watches={watches}
          seasonRatings={seasonRatings}
          openSeason={openSeason}
          onOpen={setOpenOverride}
          onTapEpisode={tapEpisode}
          onUpTo={upTo}
          onRemove={remove}
          onMarkSeason={markSeason}
          onRateSeason={(s, r) => setSeasonRating(detail.id, s, r)}
        />

        {title && title.status !== 'watchlist' && !shouldPromptRating(title) && <RatingEditor title={title} />}

        {title && (
          <>
            <ServicePicker value={title.service} suggestions={suggestServices(detail.providers)} onChange={(s) => setService(title.id, s)} />
            <Manage
              dropped={title.status === 'dropped'}
              onDrop={async () => toast({ message: `Dropped ${title.name}`, undo: await setStatus(detail, 'dropped') })}
              onResume={resume}
              onRemove={async () => toast({ message: `Removed ${title.name}`, undo: await removeTitle(title.id) })}
            />
          </>
        )}
      </div>

      {(!title || title.status === 'watchlist' || next) && title?.status !== 'dropped' && (
        <ActionBar>
          {!title && (
            <button type="button" className={secondary} onClick={async () => toast({ message: 'Added to watchlist', undo: await addToWatchlist(detail) })}>
              <Bookmark size={18} aria-hidden /> Watchlist
            </button>
          )}
          {next && (
            <button type="button" className={primary} onClick={() => logOne(next)}>
              <Check size={20} strokeWidth={3} aria-hidden /> Watched S{next.season} E{next.episode}
            </button>
          )}
          {!next && title?.status === 'watchlist' && (
            <p className="flex-1 self-center px-2 text-sm text-muted">On your watchlist</p>
          )}
        </ActionBar>
      )}

      {dup && dupWatch && (
        <DuplicateGuard
          label={label(dup)}
          watchedOn={formatDate(dupWatch.watchedAt)}
          onCancel={() => setDup(null)}
          onRewatch={() => {
            const r = dup
            setDup(null)
            void logOne(r, true)
          }}
          onRemove={() => {
            const r = dup
            setDup(null)
            void remove(r)
          }}
        />
      )}
    </>
  )
}

function Manage({ dropped, onDrop, onResume, onRemove }: { dropped: boolean; onDrop: () => void; onResume: () => void; onRemove: () => void }) {
  return (
    <section aria-label="Manage" className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
      {dropped ? (
        <button type="button" onClick={onResume} className="min-h-11 rounded-xl border border-line px-4 text-sm font-medium hover:bg-surface-2">
          Resume watching
        </button>
      ) : (
        <button type="button" onClick={onDrop} className="min-h-11 rounded-xl border border-line px-4 text-sm font-medium hover:bg-surface-2">
          Mark as dropped
        </button>
      )}
      <ConfirmButton confirmLabel="Yes, remove" onConfirm={onRemove}>
        <span className="flex items-center gap-2">
          <Trash2 size={16} aria-hidden /> Remove from library
        </span>
      </ConfirmButton>
    </section>
  )
}

/* ------------------------------ Movie ------------------------------ */

function MovieView({ detail }: { detail: TitleDetail }) {
  const toast = useToast()
  const title = useTitle(detail.id)
  const history = useMovieWatches(detail.id)
  const [date, setDate] = useState(() => toDateInput(new Date().toISOString()))
  const [time, setTime] = useState('')
  const [timeError, setTimeError] = useState(false)

  const badge = badgeFor(title, history)
  const sorted = [...history].sort((a, b) => b.watchedAt.localeCompare(a.watchedAt))

  async function markWatched() {
    const undo = await logMovie(detail, { completed: true, watchedAt: fromDateInput(date) })
    toast({ message: `Watched ${detail.name}`, undo })
    setTime('')
  }
  async function saveProgress() {
    const minutes = parseHm(time)
    if (minutes === null || minutes <= 0) return setTimeError(true)
    setTimeError(false)
    const undo = await logMovie(detail, { completed: false, stoppedAtMinutes: minutes, watchedAt: fromDateInput(date) })
    toast({ message: `Saved: stopped at ${formatHm(minutes)}`, undo })
    setTime('')
  }

  return (
    <>
      <Header detail={detail}>
        <StatusBadge badge={badge} />
      </Header>
      {detail.overview && <p className="mb-5 text-sm leading-relaxed text-muted">{detail.overview}</p>}

      <div className="flex flex-col gap-6">
        {title && shouldPromptRating(title) && <RatingPrompt title={title} />}

        <section aria-labelledby="log" className="rounded-2xl border border-line bg-surface p-4">
          <h2 id="log" className="mb-3 font-semibold">
            Log a watch
          </h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="date" className="text-xs font-medium text-muted">
                Date
              </label>
              <input id="date" type="date" value={date} max={toDateInput(new Date().toISOString())} onChange={(e) => setDate(e.target.value || date)} className="min-h-11 rounded-xl border border-line bg-bg px-3 text-base" />
            </div>
            <TimeInput value={time} onChange={setTime} invalid={timeError} />
            <button type="button" onClick={saveProgress} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold hover:bg-surface-2">
              Save progress
            </button>
          </div>
          {timeError && <p role="alert" className="mt-2 text-sm text-danger">Enter a time like 1:12.</p>}
        </section>

        {title && title.status !== 'watchlist' && !shouldPromptRating(title) && <RatingEditor title={title} />}

        {sorted.length > 0 && (
          <section aria-labelledby="history">
            <h2 id="history" className="mb-2 text-xs font-medium text-muted">
              Watch history
            </h2>
            <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
              {sorted.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-2 pl-4">
                  <span className="py-3 text-sm">
                    <span className={w.completed ? 'font-medium text-accent' : 'font-medium'}>{w.completed ? 'Watched' : `Stopped at ${formatHm(w.stoppedAtMinutes ?? 0)}`}</span>
                    <span className="text-muted"> · {formatDate(w.watchedAt)}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete entry from ${formatDate(w.watchedAt)}`}
                    onClick={async () => toast({ message: 'Entry deleted', undo: await deleteMovieWatch(detail.id, w.id) })}
                    className="grid h-11 w-11 place-items-center rounded-xl text-muted hover:text-danger"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {title ? (
          <>
            <ServicePicker value={title.service} suggestions={suggestServices(detail.providers)} onChange={(s) => setService(title.id, s)} />
            <Manage
              dropped={title.status === 'dropped'}
              onDrop={async () => toast({ message: `Dropped ${title.name}`, undo: await setStatus(detail, 'dropped') })}
              onResume={async () => toast({ message: 'Moved back to your library', undo: await setStatus(detail, history.some((w) => w.completed) ? 'finished' : history.length ? 'watching' : 'watchlist') })}
              onRemove={async () => toast({ message: `Removed ${title.name}`, undo: await removeTitle(title.id) })}
            />
          </>
        ) : null}
      </div>

      <ActionBar>
        {!title && (
          <button type="button" className={secondary} onClick={async () => toast({ message: 'Added to watchlist', undo: await addToWatchlist(detail) })}>
            <Bookmark size={18} aria-hidden /> Watchlist
          </button>
        )}
        <button type="button" className={primary} onClick={markWatched}>
          <Check size={20} strokeWidth={3} aria-hidden /> {history.some((w) => w.completed) ? 'Log rewatch' : 'Mark watched'}
        </button>
      </ActionBar>
    </>
  )
}
