import { describe, expect, it } from 'vitest'
import { airedEpisodes, episodesUpTo, firstWatch, highestWatched, nextEpisode, progress, type SeasonEpisodes } from './episodes'

const ep = (episode: number, airDate?: string) => ({ episode, name: `Ep ${episode}`, airDate })
const seasons: SeasonEpisodes[] = [
  { season: 0, episodes: [ep(1, '2000-01-01')] },
  { season: 1, episodes: [ep(1, '2020-01-01'), ep(2, '2020-01-08'), ep(3, '2020-01-15')] },
  { season: 2, episodes: [ep(1, '2021-01-01'), ep(2, '2999-01-01')] },
]
const today = new Date('2025-06-01T12:00:00')
const w = (season: number, episode: number) => ({ season, episode })

describe('episodes', () => {
  it('lists aired regular episodes in order, skipping specials and future ones', () => {
    expect(airedEpisodes(seasons, today).map((e) => `${e.season}:${e.episode}`)).toEqual(['1:1', '1:2', '1:3', '2:1'])
  })
  it('treats missing air dates as aired', () => {
    expect(airedEpisodes([{ season: 1, episodes: [ep(1)] }], today)).toHaveLength(1)
  })
  it('next episode with no watches is the first aired one', () => {
    expect(nextEpisode(seasons, [], today)).toMatchObject({ season: 1, episode: 1 })
  })
  it('next episode follows the highest watched, even with gaps', () => {
    expect(nextEpisode(seasons, [w(1, 1), w(1, 3)], today)).toMatchObject({ season: 2, episode: 1 })
  })
  it('crosses season boundaries', () => {
    expect(nextEpisode(seasons, [w(1, 3)], today)).toMatchObject({ season: 2, episode: 1 })
  })
  it('returns null when caught up on aired episodes', () => {
    expect(nextEpisode(seasons, [w(2, 1)], today)).toBeNull()
  })
  it('ignores specials in highestWatched', () => {
    expect(highestWatched([w(0, 5), w(1, 2)])).toEqual(w(1, 2))
    expect(highestWatched([w(0, 5)])).toBeNull()
  })
  it('computes progress over aired episodes', () => {
    expect(progress(seasons, [w(1, 1), w(1, 2)], today)).toBe(0.5)
    expect(progress([], [], today)).toBe(0)
  })
  it('episodesUpTo includes earlier seasons and the target', () => {
    expect(episodesUpTo(seasons, w(2, 1)).map((e) => `${e.season}:${e.episode}`)).toEqual(['1:1', '1:2', '1:3', '2:1'])
  })
  it('firstWatch returns the earliest', () => {
    const ws = [
      { season: 1, episode: 1, watchedAt: '2026-02-03' },
      { season: 1, episode: 1, watchedAt: '2026-01-01' },
    ]
    expect(firstWatch(ws, 1, 1)?.watchedAt).toBe('2026-01-01')
    expect(firstWatch(ws, 1, 2)).toBeUndefined()
  })
})
