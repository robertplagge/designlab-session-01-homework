import type { EpisodeInfo, EpisodeWatch } from '../types'

export interface SeasonEpisodes {
  season: number
  episodes: EpisodeInfo[]
}
export interface EpisodeRef {
  season: number
  episode: number
}

const cmp = (a: EpisodeRef, b: EpisodeRef) => a.season - b.season || a.episode - b.episode
export const keyOf = (season: number, episode: number) => `${season}:${episode}`

/** True when the episode has aired (unknown air dates count as aired). */
export function hasAired(ep: EpisodeInfo, today: Date = new Date()): boolean {
  if (!ep.airDate) return true
  const d = new Date(ep.airDate + 'T00:00:00')
  return Number.isNaN(d.getTime()) || d.getTime() <= today.getTime()
}

/** Flat, ordered list of aired regular episodes (season 0 / specials excluded). */
export function airedEpisodes(seasons: SeasonEpisodes[], today: Date = new Date()): (EpisodeRef & EpisodeInfo)[] {
  return seasons
    .filter((s) => s.season > 0)
    .flatMap((s) => s.episodes.filter((e) => hasAired(e, today)).map((e) => ({ ...e, season: s.season })))
    .sort(cmp)
}

/** Set of "season:episode" keys that have at least one watch. */
export function watchedSet(watches: Pick<EpisodeWatch, 'season' | 'episode'>[]): Set<string> {
  return new Set(watches.map((w) => keyOf(w.season, w.episode)))
}

export function highestWatched(watches: Pick<EpisodeWatch, 'season' | 'episode'>[]): EpisodeRef | null {
  const regular = watches.filter((w) => w.season > 0)
  if (!regular.length) return null
  return regular.reduce((a, b) => (cmp(a, b) >= 0 ? a : b))
}

/**
 * Next episode to watch: the first aired episode after the highest watched one.
 * With no watches, the first aired episode. Null when nothing is left.
 */
export function nextEpisode(
  seasons: SeasonEpisodes[],
  watches: Pick<EpisodeWatch, 'season' | 'episode'>[],
  today: Date = new Date(),
): (EpisodeRef & EpisodeInfo) | null {
  const aired = airedEpisodes(seasons, today)
  const high = highestWatched(watches)
  if (!high) return aired[0] ?? null
  return aired.find((e) => cmp(e, high) > 0) ?? null
}

/** Progress of aired episodes watched (0–1). */
export function progress(
  seasons: SeasonEpisodes[],
  watches: Pick<EpisodeWatch, 'season' | 'episode'>[],
  today: Date = new Date(),
): number {
  const aired = airedEpisodes(seasons, today)
  if (!aired.length) return 0
  const seen = watchedSet(watches)
  return aired.filter((e) => seen.has(keyOf(e.season, e.episode))).length / aired.length
}

/** Episodes up to and including `upTo`, for "Watched up to here". */
export function episodesUpTo(seasons: SeasonEpisodes[], upTo: EpisodeRef): (EpisodeRef & EpisodeInfo)[] {
  return seasons
    .filter((s) => s.season > 0)
    .flatMap((s) => s.episodes.map((e) => ({ ...e, season: s.season })))
    .filter((e) => cmp(e, upTo) <= 0)
    .sort(cmp)
}

/** Latest first-watch (non-rewatch preferred) date for an episode. */
export function firstWatch<T extends Pick<EpisodeWatch, 'season' | 'episode' | 'watchedAt'>>(
  watches: T[],
  season: number,
  episode: number,
): T | undefined {
  return watches
    .filter((w) => w.season === season && w.episode === episode)
    .sort((a, b) => a.watchedAt.localeCompare(b.watchedAt))[0]
}
