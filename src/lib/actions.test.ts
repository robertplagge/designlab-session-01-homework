import { beforeEach, describe, expect, it } from 'vitest'
import {
  exportAll,
  importData,
  logEpisodes,
  logMovie,
  markSeasonWatched,
  markWatchedUpTo,
  resetAll,
  setRating,
  unwatchEpisode,
} from './actions'
import { db } from './db'
import { badgeFor } from './logic/badge'
import { MOVIES } from './mock/movies'
import { SERIES } from './mock/series'

const bb = SERIES.find((s) => s.detail.tmdbId === 1396)!
const fleabag = SERIES.find((s) => s.detail.tmdbId === 67070)!
const bear = SERIES.find((s) => s.detail.tmdbId === 136315)!

beforeEach(async () => {
  await resetAll()
})

describe('series flow (definition of done)', () => {
  it('watched up to S1E4 → S1 E5 next → ✓ → S1 E6 next', async () => {
    await markWatchedUpTo(bb.detail, bb.seasons, { season: 1, episode: 4 })
    let t = (await db.titles.get('tv:1396'))!
    expect(t.status).toBe('watching')
    expect(badgeFor(t)!.text).toBe('S1 E5 next')

    await logEpisodes(bb.detail, bb.seasons, [{ season: 1, episode: 5 }])
    t = (await db.titles.get('tv:1396'))!
    expect(badgeFor(t)!.text).toBe('S1 E6 next')
    expect(t.nextEpisode?.name).toBe("Crazy Handful of Nothin'")
  })

  it('undo restores the previous state', async () => {
    await markWatchedUpTo(bb.detail, bb.seasons, { season: 1, episode: 4 })
    const undo = await logEpisodes(bb.detail, bb.seasons, [{ season: 1, episode: 5 }])
    await undo()
    expect((await db.titles.get('tv:1396'))!.nextEpisode).toMatchObject({ season: 1, episode: 5 })
    expect(await db.episodeWatches.count()).toBe(4)
  })

  it('undo of the first log removes the title again', async () => {
    const undo = await logEpisodes(bb.detail, bb.seasons, [{ season: 1, episode: 1 }])
    await undo()
    expect(await db.titles.count()).toBe(0)
  })

  it('skips already-watched episodes unless rewatch is requested', async () => {
    await logEpisodes(bb.detail, bb.seasons, [{ season: 1, episode: 1 }])
    await logEpisodes(bb.detail, bb.seasons, [{ season: 1, episode: 1 }])
    expect(await db.episodeWatches.count()).toBe(1)
    await logEpisodes(bb.detail, bb.seasons, [{ season: 1, episode: 1 }], { rewatch: true })
    const all = await db.episodeWatches.toArray()
    expect(all).toHaveLength(2)
    expect(all.filter((w) => w.isRewatch)).toHaveLength(1)
  })

  it('marking a season logs only the missing episodes', async () => {
    await logEpisodes(bb.detail, bb.seasons, [{ season: 1, episode: 2 }])
    await markSeasonWatched(bb.detail, bb.seasons, 1)
    expect(await db.episodeWatches.count()).toBe(7)
    expect((await db.titles.get('tv:1396'))!.nextEpisode).toMatchObject({ season: 2, episode: 1 })
  })

  it('finishing an ended show sets finished; an airing one sets caught_up', async () => {
    await markWatchedUpTo(fleabag.detail, fleabag.seasons, { season: 2, episode: 6 })
    expect((await db.titles.get('tv:67070'))!.status).toBe('finished')
    await markWatchedUpTo(bear.detail, bear.seasons, { season: 4, episode: 10 })
    expect((await db.titles.get('tv:136315'))!.status).toBe('caught_up')
  })

  it('unwatching moves the next episode back', async () => {
    await markWatchedUpTo(bb.detail, bb.seasons, { season: 1, episode: 3 })
    await unwatchEpisode('tv:1396', bb.seasons, 1, 3)
    expect((await db.titles.get('tv:1396'))!.nextEpisode).toMatchObject({ season: 1, episode: 3 })
  })
})

describe('movies + ratings', () => {
  const m = MOVIES[0]!
  it('completed watch finishes the movie and the badge shows date + rating', async () => {
    await logMovie(m, { completed: true })
    await setRating(m.id, 4)
    const t = (await db.titles.get(m.id))!
    expect(t.status).toBe('finished')
    expect(badgeFor(t, await db.movieWatches.toArray())!.text).toMatch(/^Watched · .+ · ★4$/)
  })
  it('partial progress pauses', async () => {
    await logMovie(m, { completed: false, stoppedAtMinutes: 72 })
    const t = (await db.titles.get(m.id))!
    expect(t.status).toBe('watching')
    expect(badgeFor(t, await db.movieWatches.toArray())!.text).toBe('Paused at 1:12')
  })
})

describe('portability', () => {
  it('Export → Reset → Import restores the exact state', async () => {
    await markWatchedUpTo(bb.detail, bb.seasons, { season: 1, episode: 4 })
    await logEpisodes(bb.detail, bb.seasons, [{ season: 1, episode: 2 }], { rewatch: true })
    await logMovie(MOVIES[1]!, { completed: false, stoppedAtMinutes: 45 })
    await setRating('tv:1396', 4.5, 'Great start')

    const before = await exportAll()
    const json = JSON.parse(JSON.stringify(before))
    await resetAll()
    expect(await db.titles.count()).toBe(0)

    await importData(json)
    const after = await exportAll()
    expect({ ...after, exportedAt: '' }).toEqual({ ...before, exportedAt: '' })
  })

  it('importing twice does not duplicate anything', async () => {
    await markWatchedUpTo(bb.detail, bb.seasons, { season: 1, episode: 3 })
    const file = JSON.parse(JSON.stringify(await exportAll()))
    await importData(file)
    await importData(file)
    expect(await db.episodeWatches.count()).toBe(3)
    expect(await db.titles.count()).toBe(1)
  })

  it('rejects files that are not Seen exports', async () => {
    await expect(importData({ hello: 'world' })).rejects.toThrow()
  })
})
