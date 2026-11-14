import type { Status } from '../types'
import { nextEpisode, type SeasonEpisodes } from './episodes'
import type { EpisodeWatch, MovieWatch } from '../types'

/** Status of a series after its watches change. */
export function seriesStatus(args: {
  current: Status
  seasons: SeasonEpisodes[]
  watches: Pick<EpisodeWatch, 'season' | 'episode'>[]
  inProduction: boolean
  today?: Date
}): Status {
  const { current, seasons, watches, inProduction, today } = args
  const regular = watches.filter((w) => w.season > 0)
  if (!regular.length) return current === 'dropped' ? 'dropped' : 'watchlist'
  if (nextEpisode(seasons, regular, today)) return 'watching'
  return inProduction ? 'caught_up' : 'finished'
}

/** Status of a movie after a watch is logged. */
export function movieStatusAfterWatch(completed: boolean): Status {
  return completed ? 'finished' : 'watching'
}

/** Whether the inline rating prompt should appear. */
export function shouldPromptRating(t: { status: Status; rating?: number; ratingPromptHandled?: boolean }): boolean {
  return t.status === 'finished' && t.rating === undefined && !t.ratingPromptHandled
}

/** Status of a movie derived from its remaining watch entries. */
export function movieStatusFromWatches(current: Status, watches: Pick<MovieWatch, 'completed' | 'watchedAt'>[]): Status {
  if (!watches.length) return current === 'dropped' ? 'dropped' : 'watchlist'
  const latest = [...watches].sort((a, b) => b.watchedAt.localeCompare(a.watchedAt))[0]!
  if (latest.completed) return 'finished'
  return watches.some((w) => w.completed) ? 'finished' : 'watching'
}
