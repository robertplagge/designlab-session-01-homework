import { Search as SearchIcon, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { Poster } from '../components/Poster'
import { StatusBadge } from '../components/StatusBadge'
import { useAllTitles, useMovieWatches } from '../lib/hooks'
import { badgeFor } from '../lib/logic/badge'
import { meta, metadata } from '../lib/metadata'
import type { TitleSummary } from '../lib/types'

const SUGGESTIONS = ['Breaking Bad', 'Severance', 'Inception', 'The Bear']

export default function Search() {
  const [params, setParams] = useSearchParams()
  const urlQ = params.get('q') ?? ''
  const [input, setInput] = useState(urlQ)
  const [results, setResults] = useState<TitleSummary[] | null>(null)
  const [error, setError] = useState(false)
  const titles = useAllTitles()
  const movieWatches = useMovieWatches()

  const byId = useMemo(() => new Map((titles ?? []).map((t) => [t.id, t])), [titles])

  // Debounce input → URL (so back-navigation from a detail page restores the search).
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (input.trim() !== urlQ) setParams(input.trim() ? { q: input.trim() } : {}, { replace: true })
    }, 250)
    return () => window.clearTimeout(t)
  }, [input, urlQ, setParams])

  useEffect(() => {
    if (!urlQ) return
    const ctrl = new AbortController()
    meta
      .search(urlQ, ctrl.signal)
      .then((r) => {
        setResults(r)
        setError(false)
      })
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === 'AbortError')) setError(true)
      })
    return () => ctrl.abort()
  }, [urlQ])

  const shown = urlQ ? results : null

  return (
    <>
      <PageHeader title="Search" />
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mb-5">
        <label htmlFor="q" className="sr-only">
          Search movies and series
        </label>
        <SearchIcon size={18} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="q"
          type="search"
          autoFocus
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search movies and series"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-12 w-full rounded-xl border border-line bg-surface pl-10 pr-11 text-base placeholder:text-muted"
        />
        {input && (
          <button type="button" aria-label="Clear search" onClick={() => setInput('')} className="absolute right-0.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-muted hover:text-fg">
            <X size={18} aria-hidden />
          </button>
        )}
      </form>

      {!urlQ && (
        <EmptyState icon={<SearchIcon size={40} aria-hidden />} title="Have you seen it?">
          Search any movie or series to see whether you’ve watched it, and where you stopped.
          {metadata.isDemo && (
            <span className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setInput(s)} className="min-h-11 rounded-full border border-line px-4 text-sm font-medium text-fg hover:bg-surface-2">
                  {s}
                </button>
              ))}
            </span>
          )}
        </EmptyState>
      )}

      {urlQ && error && <p role="alert" className="py-8 text-center text-sm text-danger">Search failed. Check your connection and try again.</p>}
      {urlQ && !error && shown === null && <p className="py-8 text-center text-sm text-muted">Searching…</p>}
      {shown?.length === 0 && !error && <p className="py-8 text-center text-sm text-muted">No results for “{urlQ}”.</p>}

      {shown && shown.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Search results">
          {shown.map((r) => {
            const tracked = byId.get(r.id)
            const badge = badgeFor(tracked, movieWatches.filter((w) => w.titleId === r.id))
            return (
              <li key={r.id}>
                <Link to={`/title/${r.type}/${r.tmdbId}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 hover:bg-surface-2">
                  <Poster name={r.name} type={r.type} posterPath={r.posterPath} className="w-16 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                    <p className="w-full truncate font-semibold">{r.name}</p>
                    <p className="text-sm text-muted">
                      {r.type === 'movie' ? 'Movie' : 'Series'}
                      {r.year ? ` · ${r.year}` : ''}
                    </p>
                    <StatusBadge badge={badge} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
