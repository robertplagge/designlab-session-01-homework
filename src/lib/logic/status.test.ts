import { describe, expect, it } from 'vitest'
import { movieStatusAfterWatch, seriesStatus, shouldPromptRating } from './status'

const seasons = [{ season: 1, episodes: [1, 2].map((n) => ({ episode: n, name: 'x', airDate: '2020-01-01' })) }]
const today = new Date('2025-01-01')

describe('seriesStatus', () => {
  it('watching while episodes remain', () => {
    expect(seriesStatus({ current: 'watchlist', seasons, watches: [{ season: 1, episode: 1 }], inProduction: true, today })).toBe('watching')
  })
  it('caught_up when airing and nothing left', () => {
    expect(seriesStatus({ current: 'watching', seasons, watches: [{ season: 1, episode: 2 }], inProduction: true, today })).toBe('caught_up')
  })
  it('finished when ended and nothing left', () => {
    expect(seriesStatus({ current: 'watching', seasons, watches: [{ season: 1, episode: 2 }], inProduction: false, today })).toBe('finished')
  })
  it('logging revives a dropped title', () => {
    expect(seriesStatus({ current: 'dropped', seasons, watches: [{ season: 1, episode: 1 }], inProduction: false, today })).toBe('watching')
  })
  it('no watches: dropped stays dropped, others return to watchlist', () => {
    expect(seriesStatus({ current: 'dropped', seasons, watches: [], inProduction: false, today })).toBe('dropped')
    expect(seriesStatus({ current: 'watching', seasons, watches: [], inProduction: false, today })).toBe('watchlist')
  })
})

describe('movie + rating prompt', () => {
  it('maps completion to status', () => {
    expect(movieStatusAfterWatch(true)).toBe('finished')
    expect(movieStatusAfterWatch(false)).toBe('watching')
  })
  it('prompts once, only when finished and unrated', () => {
    expect(shouldPromptRating({ status: 'finished' })).toBe(true)
    expect(shouldPromptRating({ status: 'finished', rating: 4 })).toBe(false)
    expect(shouldPromptRating({ status: 'finished', ratingPromptHandled: true })).toBe(false)
    expect(shouldPromptRating({ status: 'watching' })).toBe(false)
  })
})

import { movieStatusFromWatches } from './status'
describe('movieStatusFromWatches', () => {
  it('derives from entries', () => {
    expect(movieStatusFromWatches('watching', [])).toBe('watchlist')
    expect(movieStatusFromWatches('watchlist', [{ completed: false, watchedAt: '2026-01-01' }])).toBe('watching')
    expect(movieStatusFromWatches('watching', [{ completed: true, watchedAt: '2026-01-01' }])).toBe('finished')
  })
})
