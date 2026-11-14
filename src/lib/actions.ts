import { db } from './db'
import { nowIso } from './dates'
import { seasonKey, uuid } from './ids'
import {
  airedEpisodes,
  episodesUpTo,
  keyOf,
  nextEpisode,
  watchedSet,
  type EpisodeRef,
  type SeasonEpisodes,
} from './logic/episodes'
import { dedupeEpisodeWatches, mergeDatasets, parseExport, type Dataset } from './logic/merge'
import { movieStatusFromWatches, seriesStatus } from './logic/status'
import type { EpisodeWatch, ExportFile, MovieWatch, Settings, Status, Title, TitleDetail } from './types'

/** Reverts the mutation that returned it. */
export type Undo = () => Promise<void>

const DATA_TABLES = [db.titles, db.episodeWatches, db.movieWatches, db.seasonRatings]

/** Snapshot everything we hold for a title; the returned function restores it exactly. */
async function snapshot(id: string): Promise<Undo> {
  const [title, ew, mw, sr] = await Promise.all([
    db.titles.get(id),
    db.episodeWatches.where('titleId').equals(id).toArray(),
    db.movieWatches.where('titleId').equals(id).toArray(),
    db.seasonRatings.where('titleId').equals(id).toArray(),
  ])
  return () =>
    db.transaction('rw', DATA_TABLES, async () => {
      await Promise.all([
        db.episodeWatches.where('titleId').equals(id).delete(),
        db.movieWatches.where('titleId').equals(id).delete(),
        db.seasonRatings.where('titleId').equals(id).delete(),
      ])
      await Promise.all([db.episodeWatches.bulkPut(ew), db.movieWatches.bulkPut(mw), db.seasonRatings.bulkPut(sr)])
      if (title) await db.titles.put({ ...title, updatedAt: nowIso() })
      else await db.titles.delete(id)
    })
}

function fromDetail(d: TitleDetail, status: Status): Title {
  const now = nowIso()
  return {
    id: d.id,
    tmdbId: d.tmdbId,
    type: d.type,
    name: d.name,
    year: d.year,
    posterPath: d.posterPath,
    status,
    addedAt: now,
    updatedAt: now,
    inProduction: d.inProduction,
    seasonCount: d.seasons?.filter((s) => s.season > 0).length,
    runtime: d.runtime,
  }
}

/** Insert the title if untracked; otherwise refresh its metadata fields without touching user state. */
async function ensureTitle(d: TitleDetail, status: Status): Promise<Title> {
  const existing = await db.titles.get(d.id)
  if (!existing) {
    const t = fromDetail(d, status)
    await db.titles.put(t)
    return t
  }
  const fresh = fromDetail(d, existing.status)
  const merged: Title = {
    ...existing,
    name: fresh.name,
    year: fresh.year ?? existing.year,
    posterPath: fresh.posterPath ?? existing.posterPath,
    inProduction: fresh.inProduction ?? existing.inProduction,
    seasonCount: fresh.seasonCount ?? existing.seasonCount,
    runtime: fresh.runtime ?? existing.runtime,
  }
  await db.titles.put(merged)
  return merged
}

export async function addToWatchlist(d: TitleDetail): Promise<Undo> {
  const undo = await snapshot(d.id)
  await db.transaction('rw', DATA_TABLES, () => ensureTitle(d, 'watchlist'))
  return undo
}

export async function removeTitle(id: string): Promise<Undo> {
  const undo = await snapshot(id)
  await db.transaction('rw', DATA_TABLES, async () => {
    await Promise.all([
      db.episodeWatches.where('titleId').equals(id).delete(),
      db.movieWatches.where('titleId').equals(id).delete(),
      db.seasonRatings.where('titleId').equals(id).delete(),
    ])
    await db.titles.delete(id)
  })
  return undo
}

export async function setStatus(d: TitleDetail, status: Status): Promise<Undo> {
  const undo = await snapshot(d.id)
  await db.transaction('rw', DATA_TABLES, async () => {
    const t = await ensureTitle(d, status)
    await db.titles.put({ ...t, status, updatedAt: nowIso() })
  })
  return undo
}

export async function setService(id: string, service: string | undefined): Promise<void> {
  await db.titles.update(id, { service, updatedAt: nowIso() })
}

export async function setRating(id: string, rating: number | undefined, note?: string): Promise<void> {
  await db.titles.update(id, {
    rating,
    note: note?.trim() || undefined,
    ratingPromptHandled: true,
    updatedAt: nowIso(),
  })
}

/** "Skip" on the inline prompt: never show it again for this title. */
export async function dismissRatingPrompt(id: string): Promise<void> {
  await db.titles.update(id, { ratingPromptHandled: true, updatedAt: nowIso() })
}

export async function setSeasonRating(titleId: string, season: number, rating: number | undefined, note?: string) {
  const id = seasonKey(titleId, season)
  if (rating === undefined) return void (await db.seasonRatings.delete(id))
  await db.seasonRatings.put({ id, titleId, season, rating, note: note?.trim() || undefined, updatedAt: nowIso() })
}

/** Recompute status, next episode and activity after the episode watches of a title changed. */
async function recomputeSeries(id: string, seasons: SeasonEpisodes[], touch: boolean): Promise<void> {
  const t = await db.titles.get(id)
  if (!t) return
  const watches = await db.episodeWatches.where('titleId').equals(id).toArray()
  const status = seriesStatus({ current: t.status, seasons, watches, inProduction: !!t.inProduction })
  const next = nextEpisode(seasons, watches)
  const now = nowIso()
  await db.titles.put({
    ...t,
    status,
    nextEpisode: next ? { season: next.season, episode: next.episode, name: next.name } : null,
    lastActivityAt: touch ? now : t.lastActivityAt,
    updatedAt: now,
  })
}

export interface LogOptions {
  watchedAt?: string
  /** Log as rewatch even if already watched (from the duplicate guard). */
  rewatch?: boolean
}

/** Log one or more episodes. Already-watched episodes are skipped unless `rewatch` is set. */
export async function logEpisodes(
  d: TitleDetail,
  seasons: SeasonEpisodes[],
  refs: EpisodeRef[],
  opts: LogOptions = {},
): Promise<Undo> {
  const undo = await snapshot(d.id)
  await db.transaction('rw', DATA_TABLES, async () => {
    await ensureTitle(d, 'watching')
    const existing = await db.episodeWatches.where('titleId').equals(d.id).toArray()
    const seen = watchedSet(existing)
    const at = opts.watchedAt ?? nowIso()
    const rows: EpisodeWatch[] = []
    for (const r of refs) {
      const already = seen.has(keyOf(r.season, r.episode))
      if (already && !opts.rewatch) continue
      rows.push({
        id: uuid(),
        titleId: d.id,
        season: r.season,
        episode: r.episode,
        watchedAt: at,
        isRewatch: already,
        updatedAt: nowIso(),
      })
    }
    await db.episodeWatches.bulkPut(rows)
    await recomputeSeries(d.id, seasons, true)
  })
  return undo
}

export const markSeasonWatched = (d: TitleDetail, seasons: SeasonEpisodes[], season: number, opts?: LogOptions) => {
  const s = airedEpisodes(seasons.filter((x) => x.season === season))
  return logEpisodes(d, seasons, s, opts)
}

/** "Watched up to here": marks every earlier unwatched episode, plus the chosen one. */
export const markWatchedUpTo = (d: TitleDetail, seasons: SeasonEpisodes[], upTo: EpisodeRef, opts?: LogOptions) =>
  logEpisodes(d, seasons, episodesUpTo(seasons, upTo), opts)

/** Remove all watches of one episode (history entry removal). */
export async function unwatchEpisode(id: string, seasons: SeasonEpisodes[], season: number, episode: number): Promise<Undo> {
  const undo = await snapshot(id)
  await db.transaction('rw', DATA_TABLES, async () => {
    await db.episodeWatches.where('[titleId+season+episode]').equals([id, season, episode]).delete()
    await recomputeSeries(id, seasons, false)
  })
  return undo
}

export interface MovieLog {
  watchedAt?: string
  completed: boolean
  stoppedAtMinutes?: number
}

export async function logMovie(d: TitleDetail, log: MovieLog): Promise<Undo> {
  const undo = await snapshot(d.id)
  await db.transaction('rw', DATA_TABLES, async () => {
    const t = await ensureTitle(d, 'watching')
    const now = nowIso()
    const row: MovieWatch = {
      id: uuid(),
      titleId: d.id,
      watchedAt: log.watchedAt ?? now,
      completed: log.completed,
      stoppedAtMinutes: log.completed ? undefined : log.stoppedAtMinutes,
      updatedAt: now,
    }
    await db.movieWatches.put(row)
    const all = await db.movieWatches.where('titleId').equals(d.id).toArray()
    await db.titles.put({ ...t, status: movieStatusFromWatches(t.status, all), lastActivityAt: now, updatedAt: now })
  })
  return undo
}

export async function deleteMovieWatch(id: string, watchId: string): Promise<Undo> {
  const undo = await snapshot(id)
  await db.transaction('rw', DATA_TABLES, async () => {
    await db.movieWatches.delete(watchId)
    const t = await db.titles.get(id)
    if (!t) return
    const all = await db.movieWatches.where('titleId').equals(id).toArray()
    await db.titles.put({ ...t, status: movieStatusFromWatches(t.status, all), updatedAt: nowIso() })
  })
  return undo
}

/* ---------- settings + portability ---------- */

export const DEFAULT_SETTINGS: Settings = { id: 'settings', region: 'DE', updatedAt: '1970-01-01T00:00:00.000Z' }

export async function setRegion(region: string): Promise<void> {
  await db.settings.put({ id: 'settings', region, updatedAt: nowIso() })
}

async function readDataset(): Promise<Dataset> {
  const [titles, episodeWatches, movieWatches, seasonRatings, settings] = await Promise.all([
    db.titles.toArray(),
    db.episodeWatches.toArray(),
    db.movieWatches.toArray(),
    db.seasonRatings.toArray(),
    db.settings.get('settings'),
  ])
  return { titles, episodeWatches, movieWatches, seasonRatings, settings }
}

export async function exportAll(): Promise<ExportFile> {
  const d = await readDataset()
  return { app: 'seen', version: 1, exportedAt: nowIso(), ...d }
}

export interface ImportResult {
  titles: number
  episodes: number
  movies: number
}

/** Merge a parsed JSON export into local data (dedupe by id / natural key, newest updatedAt wins). */
export async function importData(raw: unknown): Promise<ImportResult> {
  const incoming = parseExport(raw)
  const local = await readDataset()
  const merged = mergeDatasets(local, incoming)
  await db.transaction('rw', [...DATA_TABLES, db.settings], async () => {
    // Replace rather than put so natural-key dedupe also removes superseded local rows.
    await db.episodeWatches.clear()
    await db.episodeWatches.bulkPut(dedupeEpisodeWatches(merged.episodeWatches))
    await db.titles.bulkPut(merged.titles)
    await db.movieWatches.bulkPut(merged.movieWatches)
    await db.seasonRatings.bulkPut(merged.seasonRatings)
    if (merged.settings) await db.settings.put(merged.settings)
  })
  return {
    titles: merged.titles.length - local.titles.length,
    episodes: merged.episodeWatches.length - local.episodeWatches.length,
    movies: merged.movieWatches.length - local.movieWatches.length,
  }
}

export async function resetAll(): Promise<void> {
  await db.transaction('rw', [...DATA_TABLES, db.settings, db.seasonCache, db.detailCache], async () => {
    await Promise.all(
      [...DATA_TABLES, db.settings, db.seasonCache, db.detailCache].map((t) => (t as { clear(): Promise<void> }).clear()),
    )
  })
}
