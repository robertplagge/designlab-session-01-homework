import type { Title, TitleDetail } from './types'

/** Rebuild enough of a TitleDetail from a stored Title to run actions without a network round-trip. */
export function titleToDetail(t: Title): TitleDetail {
  return {
    id: t.id,
    tmdbId: t.tmdbId,
    type: t.type,
    name: t.name,
    year: t.year,
    posterPath: t.posterPath,
    inProduction: t.inProduction,
    runtime: t.runtime,
    seasons: t.seasonCount ? Array.from({ length: t.seasonCount }, (_, i) => ({ season: i + 1, episodeCount: 0 })) : undefined,
  }
}
