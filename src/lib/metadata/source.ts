import type { EpisodeInfo, MediaType, TitleDetail, TitleSummary } from '../types'

/**
 * Where title metadata comes from. v1 ships a bundled mock; a Supabase Edge Function that
 * proxies TMDB (so the token never reaches the browser) will be a second implementation.
 */
export interface MetadataSource {
  /** True for bundled demo data, drives the "Demo data" badge. */
  readonly isDemo: boolean
  search(query: string, signal?: AbortSignal): Promise<TitleSummary[]>
  details(type: MediaType, tmdbId: number, region: string): Promise<TitleDetail>
  season(tmdbId: number, season: number): Promise<EpisodeInfo[]>
}
