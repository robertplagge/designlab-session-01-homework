import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS } from './actions'
import { db } from './db'
import type { SeasonEpisodes } from './logic/episodes'
import { meta } from './metadata'
import { loadAllSeasons } from './metadata/seasons'
import type { MediaType, MovieWatch, Settings, Title, TitleDetail } from './types'

export function useSettings(): Settings {
  return useLiveQuery(() => db.settings.get('settings'), []) ?? DEFAULT_SETTINGS
}

/** undefined while loading, then the array. */
export function useAllTitles(): Title[] | undefined {
  return useLiveQuery(() => db.titles.toArray(), [])
}

export function useTitle(id: string): Title | undefined {
  return useLiveQuery(() => db.titles.get(id), [id])
}

export function useMovieWatches(titleId?: string): MovieWatch[] {
  return (
    useLiveQuery(
      () => (titleId ? db.movieWatches.where('titleId').equals(titleId).toArray() : db.movieWatches.toArray()),
      [titleId],
    ) ?? []
  )
}

export function useEpisodeWatches(titleId: string) {
  return useLiveQuery(() => db.episodeWatches.where('titleId').equals(titleId).toArray(), [titleId]) ?? []
}

export function useSeasonRatings(titleId: string) {
  return useLiveQuery(() => db.seasonRatings.where('titleId').equals(titleId).toArray(), [titleId]) ?? []
}

interface Async<T> {
  data?: T
  error?: string
  loading: boolean
}

export function useDetail(type: MediaType, tmdbId: number, region: string): Async<TitleDetail> {
  const [state, setState] = useState<Async<TitleDetail> & { key: string }>({ loading: true, key: '' })
  const key = `${type}:${tmdbId}:${region}`
  useEffect(() => {
    let live = true
    meta
      .details(type, tmdbId, region)
      .then((data) => live && setState({ data, loading: false, key }))
      .catch((e: unknown) => live && setState({ error: e instanceof Error ? e.message : 'Could not load', loading: false, key }))
    return () => {
      live = false
    }
  }, [type, tmdbId, region, key])
  return state.key === key ? state : { loading: true }
}

export function useSeasons(detail: TitleDetail | undefined): Async<SeasonEpisodes[]> {
  const [state, setState] = useState<Async<SeasonEpisodes[]> & { id?: string }>({ loading: true })
  const count = detail?.seasons?.filter((s) => s.season > 0).length ?? 0
  const id = detail?.type === 'tv' ? detail.id : undefined
  const tmdbId = detail?.tmdbId
  const inProd = !!detail?.inProduction
  useEffect(() => {
    if (!id || tmdbId === undefined) return
    let live = true
    loadAllSeasons(tmdbId, count, inProd).then((data) => live && setState({ data, loading: false, id }))
    return () => {
      live = false
    }
  }, [id, tmdbId, count, inProd])
  return useMemo(() => (state.id === id && id ? state : { loading: true }), [state, id])
}
