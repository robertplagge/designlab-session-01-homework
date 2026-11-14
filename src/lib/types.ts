export type MediaType = 'movie' | 'tv'
export type Status = 'watchlist' | 'watching' | 'caught_up' | 'finished' | 'dropped'

export const SERVICES = ['Netflix', 'Prime Video', 'Disney+', 'Apple TV+', 'WOW/Sky', 'Other'] as const
export type Service = (typeof SERVICES)[number]

export interface Title {
  id: string // `${type}:${tmdbId}`
  tmdbId: number
  type: MediaType
  name: string
  year?: number
  posterPath?: string
  status: Status
  service?: string
  rating?: number // 0.5–5
  note?: string
  addedAt: string
  updatedAt: string
  inProduction?: boolean
  seasonCount?: number
  runtime?: number // minutes, movies
  lastActivityAt?: string
  ratingPromptHandled?: boolean
  /** Denormalised so lists (Up next, search badges) don't need season data. */
  nextEpisode?: NextEpisode | null
}

export interface NextEpisode {
  season: number
  episode: number
  name: string
}

export interface EpisodeWatch {
  id: string
  titleId: string
  season: number
  episode: number
  watchedAt: string
  isRewatch: boolean
  updatedAt: string
}

export interface MovieWatch {
  id: string
  titleId: string
  watchedAt: string
  completed: boolean
  stoppedAtMinutes?: number
  updatedAt: string
}

export interface SeasonRating {
  id: string // `${titleId}:s${season}`
  titleId: string
  season: number
  rating: number
  note?: string
  updatedAt: string
}

export interface Settings {
  id: 'settings'
  region: string
  updatedAt: string
}

export interface EpisodeInfo {
  episode: number
  name: string
  airDate?: string // YYYY-MM-DD
  runtime?: number
}

export interface CachedSeason {
  id: string // `${titleId}:s${season}`
  titleId: string
  season: number
  episodes: EpisodeInfo[]
  fetchedAt: string
}

/** Lightweight result for search lists. */
export interface TitleSummary {
  id: string
  tmdbId: number
  type: MediaType
  name: string
  year?: number
  posterPath?: string
  overview?: string
}

export interface SeasonStub {
  season: number
  episodeCount: number
  name?: string
}

export interface TitleDetail extends TitleSummary {
  inProduction?: boolean
  runtime?: number
  seasons?: SeasonStub[]
  /** Streaming services this title is available on in the selected region. */
  providers?: string[]
}

export interface CachedDetail {
  id: string
  detail: TitleDetail
  fetchedAt: string
}

export interface ExportFile {
  app: 'seen'
  version: 1
  exportedAt: string
  titles: Title[]
  episodeWatches: EpisodeWatch[]
  movieWatches: MovieWatch[]
  seasonRatings: SeasonRating[]
  settings?: Settings
}
