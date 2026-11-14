import type { EpisodeWatch, ExportFile, MovieWatch, SeasonRating, Settings, Title } from '../types'

export interface Dataset {
  titles: Title[]
  episodeWatches: EpisodeWatch[]
  movieWatches: MovieWatch[]
  seasonRatings: SeasonRating[]
  settings?: Settings
}

export class ImportError extends Error {}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

/** Validate and narrow parsed JSON into an ExportFile. Throws ImportError with a readable message. */
export function parseExport(raw: unknown): ExportFile {
  if (!isObj(raw) || raw.app !== 'seen') throw new ImportError('This file is not a Seen export.')
  if (raw.version !== 1) throw new ImportError(`Unsupported export version: ${String(raw.version)}.`)
  const list = (k: string) => {
    const v = raw[k]
    if (v === undefined) return []
    if (!Array.isArray(v)) throw new ImportError(`"${k}" must be a list.`)
    return v
  }
  const need = (k: string, rows: unknown[], fields: string[]) => {
    for (const r of rows)
      if (!isObj(r) || fields.some((f) => r[f] === undefined)) throw new ImportError(`Invalid entry in "${k}".`)
  }
  const titles = list('titles'),
    ew = list('episodeWatches'),
    mw = list('movieWatches'),
    sr = list('seasonRatings')
  need('titles', titles, ['id', 'tmdbId', 'type', 'name', 'status', 'addedAt', 'updatedAt'])
  need('episodeWatches', ew, ['id', 'titleId', 'season', 'episode', 'watchedAt'])
  need('movieWatches', mw, ['id', 'titleId', 'watchedAt'])
  need('seasonRatings', sr, ['id', 'titleId', 'season', 'rating'])
  return {
    app: 'seen',
    version: 1,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
    titles: titles as Title[],
    episodeWatches: ew as EpisodeWatch[],
    movieWatches: mw as MovieWatch[],
    seasonRatings: sr as SeasonRating[],
    settings: isObj(raw.settings) ? (raw.settings as unknown as Settings) : undefined,
  }
}

type WithUpdated = { id: string; updatedAt?: string }

/** Union by id; on conflict the record with the newer updatedAt wins (ties keep local). */
export function mergeById<T extends WithUpdated>(local: T[], incoming: T[]): T[] {
  const map = new Map(local.map((r) => [r.id, r]))
  for (const r of incoming) {
    const cur = map.get(r.id)
    if (!cur || (r.updatedAt ?? '') > (cur.updatedAt ?? '')) map.set(r.id, r)
  }
  return [...map.values()]
}

/** One first-watch per (title, season, episode): keep the earliest, drop duplicates from imports. */
export function dedupeEpisodeWatches(watches: EpisodeWatch[]): EpisodeWatch[] {
  const firsts = new Map<string, EpisodeWatch>()
  const rest: EpisodeWatch[] = []
  for (const w of [...watches].sort((a, b) => a.watchedAt.localeCompare(b.watchedAt))) {
    if (w.isRewatch) {
      rest.push(w)
      continue
    }
    const k = `${w.titleId}|${w.season}|${w.episode}`
    if (!firsts.has(k)) firsts.set(k, w)
  }
  return [...firsts.values(), ...rest]
}

export function mergeDatasets(local: Dataset, incoming: Dataset): Dataset {
  const newerSettings =
    local.settings && incoming.settings
      ? incoming.settings.updatedAt > local.settings.updatedAt
        ? incoming.settings
        : local.settings
      : (incoming.settings ?? local.settings)
  return {
    titles: mergeById(local.titles, incoming.titles),
    episodeWatches: dedupeEpisodeWatches(mergeById(local.episodeWatches, incoming.episodeWatches)),
    movieWatches: mergeById(local.movieWatches, incoming.movieWatches),
    seasonRatings: mergeById(local.seasonRatings, incoming.seasonRatings),
    settings: newerSettings,
  }
}
