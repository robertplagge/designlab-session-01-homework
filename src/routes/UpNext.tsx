import { Check, Clapperboard } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { Poster } from '../components/Poster'
import { useToast } from '../components/useToast'
import { logEpisodes, logMovie } from '../lib/actions'
import { db } from '../lib/db'
import { useAllTitles, useMovieWatches } from '../lib/hooks'
import { formatHm } from '../lib/logic/time'
import { loadAllSeasons } from '../lib/metadata/seasons'
import { titleToDetail } from '../lib/titleDetail'
import type { Title } from '../lib/types'

const recency = (t: Title) => t.lastActivityAt ?? t.updatedAt
const href = (t: Title) => `/title/${t.type}/${t.tmdbId}`

export default function UpNext() {
  const titles = useAllTitles()
  const movieWatches = useMovieWatches()
  const toast = useToast()
  const navigate = useNavigate()
  const [logged, setLogged] = useState<string | null>(null)

  if (!titles) return <PageHeader title="Up next" />

  const inProgress = titles.filter((t) => t.status === 'watching').sort((a, b) => recency(b).localeCompare(recency(a)))
  const caughtUp = titles.filter((t) => t.status === 'caught_up').sort((a, b) => recency(b).localeCompare(recency(a)))

  const pausedAt = (t: Title) => {
    const latest = movieWatches.filter((w) => w.titleId === t.id).sort((a, b) => b.watchedAt.localeCompare(a.watchedAt))[0]
    return latest && !latest.completed && latest.stoppedAtMinutes !== undefined ? latest.stoppedAtMinutes : undefined
  }

  async function markWatched(t: Title) {
    const detail = titleToDetail(t)
    if (t.type === 'movie') {
      const undo = await logMovie(detail, { completed: true })
      toast({ message: `Watched ${t.name}`, undo })
    } else if (t.nextEpisode) {
      const seasons = await loadAllSeasons(t.tmdbId, t.seasonCount ?? 0, !!t.inProduction)
      if (seasons.length < (t.seasonCount ?? 0)) {
        toast({ message: 'Couldn’t load episodes. Check your connection.' })
        return
      }
      const { season, episode, name } = t.nextEpisode
      const undo = await logEpisodes(detail, seasons, [{ season, episode }])
      const after = await db.titles.get(t.id)
      const suffix = after?.status === 'finished' ? ' · Finished!' : after?.status === 'caught_up' ? ' · Caught up' : ''
      toast({ message: `S${season} E${episode} · ${name}${suffix}`, undo })
    }
    setLogged(t.id)
    window.setTimeout(() => setLogged((cur) => (cur === t.id ? null : cur)), 700)
  }

  return (
    <>
      <PageHeader title="Up next" />

      {inProgress.length === 0 && caughtUp.length === 0 ? (
        <EmptyState
          icon={<Clapperboard size={40} aria-hidden />}
          title="Nothing in progress yet"
          action={
            <button type="button" onClick={() => navigate('/search')} className="min-h-12 rounded-full bg-accent px-5 font-semibold text-accent-ink">
              Search a title
            </button>
          }
        >
          Search a show you’re watching and tap the episode you’re on.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {inProgress.map((t) => {
            const stopped = t.type === 'movie' ? pausedAt(t) : undefined
            const canLog = t.type === 'movie' || !!t.nextEpisode
            return (
              <li key={t.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
                <Link to={href(t)} className="w-24 shrink-0" aria-label={`Open ${t.name}`} tabIndex={-1}>
                  <Poster name={t.name} type={t.type} posterPath={t.posterPath} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link to={href(t)} className="truncate text-base font-semibold hover:underline">
                    {t.name}
                  </Link>
                  <p className="truncate text-sm text-muted">{t.service ?? (t.type === 'movie' ? 'Movie' : 'Series')}</p>
                  <p className="mt-1 text-sm font-medium">
                    {t.type === 'movie'
                      ? stopped !== undefined
                        ? `Paused at ${formatHm(stopped)}`
                        : 'In progress'
                      : t.nextEpisode
                        ? `S${t.nextEpisode.season} E${t.nextEpisode.episode} · ${t.nextEpisode.name}`
                        : 'Pick where you left off'}
                  </p>
                  {canLog ? (
                    <button
                      type="button"
                      onClick={() => markWatched(t)}
                      className={`mt-auto flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-4 font-semibold text-accent-ink active:scale-[0.98] ${logged === t.id ? 'anim-pop' : ''}`}
                    >
                      <Check size={20} strokeWidth={2.5} aria-hidden />
                      <span>Watched</span>
                      <span className="sr-only">{t.type === 'tv' && t.nextEpisode ? `S${t.nextEpisode.season} E${t.nextEpisode.episode} of ${t.name}` : t.name}</span>
                    </button>
                  ) : (
                    <Link to={href(t)} className="mt-auto flex min-h-12 items-center justify-center rounded-full border border-line font-semibold hover:bg-surface-2">
                      Choose episode
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {caughtUp.length > 0 && (
        <section aria-labelledby="caught-up" className="mt-8">
          <h2 id="caught-up" className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Caught up
          </h2>
          <ul className="flex flex-col gap-2">
            {caughtUp.map((t) => (
              <li key={t.id}>
                <Link to={href(t)} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2 hover:bg-surface-2">
                  <Poster name={t.name} type={t.type} posterPath={t.posterPath} className="w-12 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.name}</p>
                    <p className="text-sm text-muted">Waiting for new episodes</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
