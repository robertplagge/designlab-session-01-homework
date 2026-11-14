import Dexie, { type EntityTable } from 'dexie'
import type {
  CachedDetail,
  CachedSeason,
  EpisodeWatch,
  MovieWatch,
  SeasonRating,
  Settings,
  Title,
} from './types'

export class SeenDB extends Dexie {
  titles!: EntityTable<Title, 'id'>
  episodeWatches!: EntityTable<EpisodeWatch, 'id'>
  movieWatches!: EntityTable<MovieWatch, 'id'>
  seasonRatings!: EntityTable<SeasonRating, 'id'>
  settings!: EntityTable<Settings, 'id'>
  seasonCache!: EntityTable<CachedSeason, 'id'>
  detailCache!: EntityTable<CachedDetail, 'id'>

  constructor(name = 'seen') {
    super(name)
    this.version(1).stores({
      titles: 'id, status, type, updatedAt, lastActivityAt',
      episodeWatches: 'id, titleId, [titleId+season+episode]',
      movieWatches: 'id, titleId',
      seasonRatings: 'id, titleId',
      settings: 'id',
      seasonCache: 'id, titleId',
      detailCache: 'id',
    })
  }
}

export const db = new SeenDB()
