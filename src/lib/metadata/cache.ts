import { db } from '../db'
import { seasonKey } from '../ids'
import type { EpisodeInfo, MediaType, TitleDetail } from '../types'
import type { MetadataSource } from './source'

const DAY = 24 * 60 * 60 * 1000
const fresh = (iso: string, ttl: number) => Date.now() - new Date(iso).getTime() < ttl

/** Cache-first access to metadata. Falls back to stale cache when the source fails (offline). */
export function createCachedMetadata(source: MetadataSource) {
  return {
    isDemo: source.isDemo,
    search: source.search.bind(source),

    async details(type: MediaType, tmdbId: number, region: string): Promise<TitleDetail> {
      const id = `${type}:${tmdbId}`
      const cached = await db.detailCache.get(id)
      if (cached && fresh(cached.fetchedAt, 7 * DAY)) return cached.detail
      try {
        const detail = await source.details(type, tmdbId, region)
        await db.detailCache.put({ id, detail, fetchedAt: new Date().toISOString() })
        return detail
      } catch (e) {
        if (cached) return cached.detail
        throw e
      }
    },

    /** Ended shows never change; airing shows are refreshed daily. */
    async season(tmdbId: number, season: number, inProduction: boolean): Promise<EpisodeInfo[]> {
      const titleId = `tv:${tmdbId}`
      const id = seasonKey(titleId, season)
      const cached = await db.seasonCache.get(id)
      if (cached && (!inProduction || fresh(cached.fetchedAt, DAY))) return cached.episodes
      try {
        const episodes = await source.season(tmdbId, season)
        await db.seasonCache.put({ id, titleId, season, episodes, fetchedAt: new Date().toISOString() })
        return episodes
      } catch (e) {
        if (cached) return cached.episodes
        throw e
      }
    },
  }
}
