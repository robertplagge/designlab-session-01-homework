import { Download, Moon, Sun, Upload } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ConfirmButton } from '../components/ConfirmButton'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/useToast'
import { exportAll, importData, resetAll, setRegion } from '../lib/actions'
import { useAuth } from '../lib/authContext'
import { useSettings } from '../lib/hooks'
import { ImportError } from '../lib/logic/merge'
import { metadata } from '../lib/metadata'
import { applyTheme, getTheme, type Theme } from '../lib/theme'

const REGIONS: [string, string][] = [
  ['DE', 'Germany'], ['AT', 'Austria'], ['CH', 'Switzerland'], ['GB', 'United Kingdom'], ['US', 'United States'],
  ['CA', 'Canada'], ['FR', 'France'], ['ES', 'Spain'], ['IT', 'Italy'], ['NL', 'Netherlands'], ['AU', 'Australia'],
]

const btn = 'flex min-h-12 items-center justify-center gap-2 rounded-full border border-line px-4 font-medium hover:bg-surface-2'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

export default function SettingsPage() {
  const toast = useToast()
  const auth = useAuth()
  const { region } = useSettings()
  const [theme, setTheme] = useState<Theme>(getTheme)
  const file = useRef<HTMLInputElement>(null)

  const choose = (t: Theme) => {
    applyTheme(t)
    setTheme(t)
  }

  async function doExport() {
    const data = await exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seen-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast({ message: `Exported ${data.titles.length} titles` })
  }

  async function doImport(f: File | undefined) {
    if (!f) return
    try {
      const r = await importData(JSON.parse(await f.text()))
      toast({ message: `Imported: ${r.titles} new titles, ${r.episodes} episode and ${r.movies} movie entries` })
    } catch (e) {
      toast({ message: e instanceof ImportError ? e.message : 'That file couldn’t be read as JSON.' })
    } finally {
      if (file.current) file.current.value = ''
    }
  }

  return (
    <>
      <PageHeader title="Settings" />

      <Section title="Account">
        {auth.user ? (
          <>
            <p className="text-sm text-muted">
              Signed in as <span className="font-medium text-fg">{auth.user.email}</span>
            </p>
            <p className="text-xs leading-relaxed text-muted">Your log is still stored on this device. Cloud sync comes next, so export a backup before switching phones.</p>
            <button
              type="button"
              onClick={async () => {
                await auth.signOut()
                toast({ message: 'Logged out' })
              }}
              className={btn}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Optional. Seen works fully without an account.</p>
            <Link to="/login" className={btn}>
              Log in or create account
            </Link>
          </>
        )}
      </Section>

      <Section title="Appearance">
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2">
          {(['dark', 'light'] as const).map((t) => (
            <button key={t} role="radio" aria-checked={theme === t} onClick={() => choose(t)} className={`${btn} ${theme === t ? 'border-accent bg-accent-soft text-accent' : ''}`}>
              {t === 'dark' ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
              {t === 'dark' ? 'Dark' : 'Light'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Region">
        <label htmlFor="region" className="text-sm text-muted">Used to suggest where a title is streaming.</label>
        <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} className="min-h-12 rounded-xl border border-line bg-surface px-3 text-base">
          {REGIONS.map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </Section>

      <Section title="Your data">
        <p className="text-sm leading-relaxed text-muted">Everything is stored on this device. No account, no cloud. Export a backup any time, or move your log to another device.</p>
        <button type="button" onClick={doExport} className={btn}>
          <Download size={18} aria-hidden /> Export JSON
        </button>
        <button type="button" onClick={() => file.current?.click()} className={btn}>
          <Upload size={18} aria-hidden /> Import JSON
        </button>
        <input ref={file} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Choose export file to import" onChange={(e) => doImport(e.target.files?.[0])} />
        <p className="text-xs text-muted">Importing merges with what’s here and skips duplicates.</p>
        <div className="mt-2">
          <ConfirmButton
            confirmLabel="Yes, delete everything"
            onConfirm={async () => {
              await resetAll()
              toast({ message: 'All data deleted' })
            }}
          >
            Reset all data
          </ConfirmButton>
        </div>
      </Section>

      <Section title="About">
        <p className="text-sm leading-relaxed text-muted">
          Seen is a private log for everything you watch, across every streaming service.
          {metadata.isDemo && ' You’re looking at a bundled demo catalogue; live data arrives with the backend.'}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          This product uses the TMDB API but is not endorsed or certified by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="font-medium text-fg underline">
            TMDB
          </a>
          . Title IDs and metadata structure follow TMDB.
        </p>
      </Section>
    </>
  )
}
