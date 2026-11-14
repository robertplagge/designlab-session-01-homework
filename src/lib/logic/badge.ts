import { formatDate } from '../dates'
import type { MovieWatch, Title } from '../types'
import { formatHm } from './time'

export type BadgeTone = 'accent' | 'neutral' | 'muted'
export interface Badge {
  text: string
  tone: BadgeTone
}

const stars = (r?: number) => (r !== undefined ? ` · ★${r}` : '')

/** The "Seen it?" badge shown on search results and detail headers. Null when the title is untracked. */
export function badgeFor(title: Title | undefined, movieWatches: MovieWatch[] = []): Badge | null {
  if (!title) return null
  if (title.status === 'watchlist') return { text: 'On watchlist', tone: 'muted' }
  if (title.status === 'dropped') return { text: 'Dropped', tone: 'muted' }

  if (title.type === 'movie') {
    const sorted = [...movieWatches].sort((a, b) => b.watchedAt.localeCompare(a.watchedAt))
    const latest = sorted[0]
    if (latest && !latest.completed && latest.stoppedAtMinutes !== undefined)
      return { text: `Paused at ${formatHm(latest.stoppedAtMinutes)}`, tone: 'neutral' }
    const done = sorted.find((w) => w.completed)
    if (done) return { text: `Watched · ${formatDate(done.watchedAt)}${stars(title.rating)}`, tone: 'accent' }
    return { text: 'Watching', tone: 'neutral' }
  }

  if (title.status === 'finished') return { text: `Finished${stars(title.rating)}`, tone: 'accent' }
  if (title.status === 'caught_up') return { text: `Caught up${stars(title.rating)}`, tone: 'accent' }
  const n = title.nextEpisode
  return { text: n ? `S${n.season} E${n.episode} next` : 'Watching', tone: 'neutral' }
}
