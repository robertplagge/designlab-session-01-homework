import type { EpisodeInfo, MediaType, TitleDetail, TitleSummary } from '../types'
import { MOVIES } from '../mock/movies'
import { SERIES } from '../mock/series'
import type { MetadataSource } from './source'

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

const summary = (d: TitleDetail): TitleSummary => ({
  id: d.id,
  tmdbId: d.tmdbId,
  type: d.type,
  name: d.name,
  year: d.year,
  posterPath: d.posterPath,
  overview: d.overview,
})

const ALL: TitleDetail[] = [...MOVIES, ...SERIES.map((s) => s.detail)]
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function createMockSource(latencyMs = 120): MetadataSource {
  return {
    isDemo: true,
    async search(query, signal) {
      await wait(latencyMs, signal)
      const q = norm(query.trim())
      if (!q) return []
      return ALL.filter((d) => norm(d.name).includes(q)).map(summary)
    },
    async details(type: MediaType, tmdbId: number) {
      await wait(latencyMs)
      const found = ALL.find((d) => d.type === type && d.tmdbId === tmdbId)
      if (!found) throw new Error('Title not found')
      return found
    },
    async season(tmdbId: number, season: number): Promise<EpisodeInfo[]> {
      await wait(latencyMs)
      const s = SERIES.find((x) => x.detail.tmdbId === tmdbId)?.seasons.find((x) => x.season === season)
      if (!s) throw new Error('Season not found')
      return s.episodes
    },
  }
}
