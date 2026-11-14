import { Library as LibraryIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { Poster } from '../components/Poster'
import { useAllTitles } from '../lib/hooks'
import { filterLibrary, tabCounts, type LibraryTab, type SortKey } from '../lib/logic/library'
import { SERVICES, type MediaType, type Title } from '../lib/types'

const TABS: { id: LibraryTab; label: string }[] = [
  { id: 'watching', label: 'Watching' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'finished', label: 'Finished' },
  { id: 'dropped', label: 'Dropped' },
]

const EMPTY: Record<LibraryTab, string> = {
  watching: 'Titles you’re in the middle of show up here.',
  watchlist: 'Open any title and tap Watchlist to save it for later.',
  finished: 'Movies and series you’ve finished end up here.',
  dropped: 'Titles you gave up on live here, so you don’t wonder later.',
}

const select = 'min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-2 text-sm'

function caption(t: Title): string {
  if (t.status === 'caught_up') return 'Caught up'
  if (t.status === 'watching' && t.type === 'tv' && t.nextEpisode) return `S${t.nextEpisode.season} E${t.nextEpisode.episode} next`
  if (t.rating !== undefined) return `★${t.rating}`
  return t.type === 'movie' ? 'Movie' : 'Series'
}

export default function Library() {
  const titles = useAllTitles()
  const navigate = useNavigate()
  const [tab, setTab] = useState<LibraryTab>('watching')
  const [type, setType] = useState<MediaType | 'all'>('all')
  const [service, setService] = useState('all')
  const [sort, setSort] = useState<SortKey>('recent')

  if (!titles) return <PageHeader title="Library" />
  const counts = tabCounts(titles)
  const items = filterLibrary(titles, { tab, type, service, sort })

  return (
    <>
      <PageHeader title="Library" />

      <div role="tablist" aria-label="Library sections" className="mb-4 grid grid-cols-4 rounded-xl bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="library-panel"
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-lg text-[0.8rem] font-semibold ${tab === t.id ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'}`}
          >
            {t.label}
            <span className="ml-1 text-xs font-normal text-muted">{counts[t.id]}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <label className="sr-only" htmlFor="f-type">Type</label>
        <select id="f-type" className={select} value={type} onChange={(e) => setType(e.target.value as MediaType | 'all')}>
          <option value="all">All types</option>
          <option value="movie">Movies</option>
          <option value="tv">Series</option>
        </select>
        <label className="sr-only" htmlFor="f-service">Service</label>
        <select id="f-service" className={select} value={service} onChange={(e) => setService(e.target.value)}>
          <option value="all">All services</option>
          {SERVICES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="f-sort">Sort</label>
        <select id="f-sort" className={select} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="recent">Recent</option>
          <option value="rating">Rating</option>
          <option value="az">A–Z</option>
        </select>
      </div>

      <div id="library-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {items.length === 0 ? (
          counts[tab] === 0 ? (
            <EmptyState
              icon={<LibraryIcon size={40} aria-hidden />}
              title={`Nothing in ${TABS.find((t) => t.id === tab)!.label} yet`}
              action={
                <button type="button" onClick={() => navigate('/search')} className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-accent-ink">
                  Search a title
                </button>
              }
            >
              {EMPTY[tab]}
            </EmptyState>
          ) : (
            <p className="py-12 text-center text-sm text-muted">No titles match these filters.</p>
          )
        ) : (
          <ul className="grid grid-cols-3 gap-x-3 gap-y-5">
            {items.map((t) => (
              <li key={t.id}>
                <Link to={`/title/${t.type}/${t.tmdbId}`} className="block rounded-lg">
                  <Poster name={t.name} type={t.type} posterPath={t.posterPath} />
                  <p className="mt-2 truncate text-sm font-medium">{t.name}</p>
                  <p className={`truncate text-xs ${t.status === 'caught_up' || t.rating !== undefined ? 'text-accent' : 'text-muted'}`}>
                    {caption(t)}
                    {t.service ? ` · ${t.service}` : ''}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
