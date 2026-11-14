import type { MediaType, Status, Title } from '../types'

export type LibraryTab = 'watching' | 'watchlist' | 'finished' | 'dropped'
export type SortKey = 'recent' | 'rating' | 'az'

export const TAB_STATUSES: Record<LibraryTab, Status[]> = {
  watching: ['watching', 'caught_up'],
  watchlist: ['watchlist'],
  finished: ['finished'],
  dropped: ['dropped'],
}

export interface LibraryFilter {
  tab: LibraryTab
  type?: MediaType | 'all'
  service?: string | 'all'
  sort: SortKey
}

const recency = (t: Title) => t.lastActivityAt ?? t.updatedAt

export function filterLibrary(titles: Title[], f: LibraryFilter): Title[] {
  const out = titles.filter(
    (t) =>
      TAB_STATUSES[f.tab].includes(t.status) &&
      (!f.type || f.type === 'all' || t.type === f.type) &&
      (!f.service || f.service === 'all' || t.service === f.service),
  )
  switch (f.sort) {
    case 'az':
      return out.sort((a, b) => a.name.localeCompare(b.name))
    case 'rating':
      return out.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.name.localeCompare(b.name))
    default:
      return out.sort((a, b) => recency(b).localeCompare(recency(a)))
  }
}

export function tabCounts(titles: Title[]): Record<LibraryTab, number> {
  const counts = { watching: 0, watchlist: 0, finished: 0, dropped: 0 }
  for (const t of titles)
    for (const tab of Object.keys(TAB_STATUSES) as LibraryTab[]) if (TAB_STATUSES[tab].includes(t.status)) counts[tab]++
  return counts
}
