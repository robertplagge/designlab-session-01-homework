import type { EpisodeInfo, MediaType, TitleDetail } from '../types'

/** All episodes on one date, a weekly cadence from a start date, or explicit dates. */
export type AirSpec = string | { weekly: string } | string[]

export interface MockSeason {
  season: number
  episodes: EpisodeInfo[]
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Build a season. Missing titles fall back to "Episode N". */
export function season(n: number, count: number, air: AirSpec, titles: string[] = [], runtime?: number): MockSeason {
  return {
    season: n,
    episodes: Array.from({ length: count }, (_, i) => {
      const airDate = Array.isArray(air) ? air[i] : typeof air === 'string' ? air : addDays(air.weekly, i * 7)
      return { episode: i + 1, name: titles[i] ?? `Episode ${i + 1}`, airDate, runtime }
    }),
  }
}

export interface MockSeries {
  detail: TitleDetail
  seasons: MockSeason[]
}

export const series = (
  tmdbId: number,
  name: string,
  year: number,
  overview: string,
  inProduction: boolean,
  seasons: MockSeason[],
  providers: string[],
): MockSeries => ({
  detail: {
    id: `tv:${tmdbId}`,
    tmdbId,
    type: 'tv' as MediaType,
    name,
    year,
    overview,
    inProduction,
    seasons: seasons.map((s) => ({ season: s.season, episodeCount: s.episodes.length })),
    providers,
  },
  seasons,
})

export const movie = (
  tmdbId: number,
  name: string,
  year: number,
  runtime: number,
  overview: string,
  providers: string[],
): TitleDetail => ({ id: `movie:${tmdbId}`, tmdbId, type: 'movie', name, year, runtime, overview, providers })
