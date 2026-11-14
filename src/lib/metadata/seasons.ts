import type { SeasonEpisodes } from '../logic/episodes'
import { meta } from './index'

/** Load every regular season (1..count) via the cache. Failed seasons are skipped. */
export async function loadAllSeasons(tmdbId: number, seasonCount: number, inProduction: boolean): Promise<SeasonEpisodes[]> {
  const results = await Promise.all(
    Array.from({ length: seasonCount }, (_, i) => i + 1).map(async (season) => {
      try {
        return { season, episodes: await meta.season(tmdbId, season, inProduction) }
      } catch {
        return null
      }
    }),
  )
  return results.filter((r): r is SeasonEpisodes => r !== null)
}
