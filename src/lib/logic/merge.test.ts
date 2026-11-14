import { describe, expect, it } from 'vitest'
import type { EpisodeWatch, Title } from '../types'
import { dedupeEpisodeWatches, ImportError, mergeById, mergeDatasets, parseExport } from './merge'

const title = (o: Partial<Title>): Title => ({ id: 'tv:1', tmdbId: 1, type: 'tv', name: 'A', status: 'watching', addedAt: '', updatedAt: '2026-01-01', ...o })
const ew = (o: Partial<EpisodeWatch>): EpisodeWatch => ({ id: 'e1', titleId: 'tv:1', season: 1, episode: 1, watchedAt: '2026-01-01', isRewatch: false, updatedAt: '2026-01-01', ...o })

describe('merge', () => {
  it('newest updatedAt wins, union otherwise', () => {
    const out = mergeById([title({ name: 'old' }), title({ id: 'tv:2' })], [title({ name: 'new', updatedAt: '2026-02-01' }), title({ id: 'tv:3' })])
    expect(out).toHaveLength(3)
    expect(out.find((t) => t.id === 'tv:1')!.name).toBe('new')
  })
  it('keeps local on ties', () => {
    expect(mergeById([title({ name: 'local' })], [title({ name: 'remote' })])[0]!.name).toBe('local')
  })
  it('dedupes first-watches with different ids, keeps rewatches', () => {
    const out = dedupeEpisodeWatches([
      ew({ id: 'a', watchedAt: '2026-02-01' }),
      ew({ id: 'b', watchedAt: '2026-01-01' }),
      ew({ id: 'c', watchedAt: '2026-03-01', isRewatch: true }),
    ])
    expect(out.map((w) => w.id).sort()).toEqual(['b', 'c'])
  })
  it('merging into an empty dataset reproduces it exactly', () => {
    const data = { titles: [title({})], episodeWatches: [ew({})], movieWatches: [], seasonRatings: [] }
    expect(mergeDatasets({ titles: [], episodeWatches: [], movieWatches: [], seasonRatings: [] }, data)).toEqual({ ...data, settings: undefined })
  })
  it('validates export files', () => {
    expect(() => parseExport({ app: 'other' })).toThrow(ImportError)
    expect(() => parseExport({ app: 'seen', version: 2 })).toThrow(ImportError)
    expect(() => parseExport({ app: 'seen', version: 1, titles: [{ id: 'x' }] })).toThrow(ImportError)
    expect(parseExport({ app: 'seen', version: 1, titles: [title({})] }).titles).toHaveLength(1)
  })
})
