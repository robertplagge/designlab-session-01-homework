import { describe, expect, it } from 'vitest'
import type { MovieWatch, Title } from '../types'
import { badgeFor } from './badge'

const base: Title = { id: 'movie:1', tmdbId: 1, type: 'movie', name: 'X', status: 'finished', addedAt: '', updatedAt: '' }
const mw = (o: Partial<MovieWatch>): MovieWatch => ({ id: 'a', titleId: 'movie:1', watchedAt: '2026-03-12T12:00:00', completed: true, updatedAt: '', ...o })

describe('badgeFor', () => {
  it('is null for untracked titles', () => expect(badgeFor(undefined)).toBeNull())
  it('watched movie shows date and stars', () => {
    const b = badgeFor({ ...base, rating: 4 }, [mw({})])!
    expect(b.text).toMatch(/^Watched · .*2026.* · ★4$/)
    expect(b.tone).toBe('accent')
  })
  it('paused movie shows timestamp', () => {
    expect(badgeFor({ ...base, status: 'watching' }, [mw({ completed: false, stoppedAtMinutes: 72 })])!.text).toBe('Paused at 1:12')
  })
  it('watchlist', () => expect(badgeFor({ ...base, status: 'watchlist' })!.text).toBe('On watchlist'))
  it('series next episode', () => {
    const t: Title = { ...base, id: 'tv:2', type: 'tv', status: 'watching', nextEpisode: { season: 2, episode: 5, name: 'n' } }
    expect(badgeFor(t)!.text).toBe('S2 E5 next')
  })
  it('finished series with rating', () => {
    expect(badgeFor({ ...base, type: 'tv', rating: 5 })!.text).toBe('Finished · ★5')
  })
})

describe('badgeFor movie rewatch', () => {
  it('latest partial entry wins over an earlier completed one', () => {
    const b = badgeFor({ ...base, status: 'watching' }, [mw({ id: 'a' }), mw({ id: 'b', watchedAt: '2026-04-01T12:00:00', completed: false, stoppedAtMinutes: 30 })])!
    expect(b.text).toBe('Paused at 0:30')
  })
})
