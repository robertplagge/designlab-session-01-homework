import { describe, expect, it } from 'vitest'
import type { Title } from '../types'
import { filterLibrary, tabCounts } from './library'

const t = (o: Partial<Title>): Title => ({ id: o.name ?? 'x', tmdbId: 1, type: 'tv', name: 'x', status: 'watching', addedAt: '', updatedAt: '2026-01-01', ...o })
const titles = [
  t({ name: 'Bravo', status: 'watching', service: 'Netflix', rating: 3, lastActivityAt: '2026-02-01' }),
  t({ name: 'Alpha', status: 'caught_up', type: 'movie', rating: 5, lastActivityAt: '2026-03-01' }),
  t({ name: 'Charlie', status: 'finished', service: 'Netflix' }),
  t({ name: 'Delta', status: 'watchlist' }),
]

describe('library', () => {
  it('watching tab includes caught up', () => {
    expect(filterLibrary(titles, { tab: 'watching', sort: 'az' }).map((x) => x.name)).toEqual(['Alpha', 'Bravo'])
  })
  it('filters by type and service', () => {
    expect(filterLibrary(titles, { tab: 'watching', type: 'tv', sort: 'az' }).map((x) => x.name)).toEqual(['Bravo'])
    expect(filterLibrary(titles, { tab: 'finished', service: 'Netflix', sort: 'az' })).toHaveLength(1)
    expect(filterLibrary(titles, { tab: 'finished', service: 'Disney+', sort: 'az' })).toHaveLength(0)
  })
  it('sorts by recent and rating', () => {
    expect(filterLibrary(titles, { tab: 'watching', sort: 'recent' })[0]!.name).toBe('Alpha')
    expect(filterLibrary(titles, { tab: 'watching', sort: 'rating' })[0]!.name).toBe('Alpha')
  })
  it('counts tabs', () => expect(tabCounts(titles)).toEqual({ watching: 2, watchlist: 1, finished: 1, dropped: 0 }))
})
