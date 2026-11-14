import { useState } from 'react'
import { dismissRatingPrompt, setRating } from '../lib/actions'
import type { Title } from '../lib/types'
import { StarRating } from './StarRating'

/** Inline, one-time prompt shown when a title is finished. Never blocks anything. */
export function RatingPrompt({ title }: { title: Title }) {
  const [rating, setLocal] = useState<number | undefined>()
  const [note, setNote] = useState('')
  return (
    <section aria-label="Rate this title" className="anim-slide-up rounded-2xl border border-accent/40 bg-accent-soft p-4">
      <h2 className="font-semibold">You finished {title.name}. How was it?</h2>
      <div className="mt-2">
        <StarRating label={`Rate ${title.name}`} value={rating} onChange={setLocal} />
      </div>
      <label htmlFor="prompt-note" className="sr-only">
        One-line note (optional)
      </label>
      <input
        id="prompt-note"
        value={note}
        maxLength={140}
        onChange={(e) => setNote(e.target.value)}
        placeholder="One-line note (optional)"
        className="mt-2 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base placeholder:text-muted"
      />
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={rating === undefined && !note.trim()} onClick={() => setRating(title.id, rating, note)} className="min-h-11 rounded-full bg-accent px-5 font-semibold text-accent-ink disabled:opacity-40">
          Save
        </button>
        <button type="button" onClick={() => dismissRatingPrompt(title.id)} className="min-h-11 rounded-full px-5 font-medium text-muted hover:bg-surface-2 hover:text-fg">
          Skip
        </button>
      </div>
    </section>
  )
}

/** Always-available rating + note for a tracked title. Saves the note on blur. */
export function RatingEditor({ title }: { title: Title }) {
  const [note, setNote] = useState(title.note ?? '')
  // Re-sync when the stored note changes elsewhere (undo, import) without an effect.
  const [seen, setSeen] = useState(title.note)
  if (seen !== title.note) {
    setSeen(title.note)
    setNote(title.note ?? '')
  }
  return (
    <section aria-labelledby="your-rating">
      <h2 id="your-rating" className="mb-1 text-xs font-medium text-muted">
        Your rating
      </h2>
      <StarRating label={`Rate ${title.name}`} value={title.rating} onChange={(r) => setRating(title.id, r, note)} />
      <label htmlFor="note" className="sr-only">
        One-line note
      </label>
      <input
        id="note"
        value={note}
        maxLength={140}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => note.trim() !== (title.note ?? '') && setRating(title.id, title.rating, note)}
        placeholder="One-line note"
        className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base placeholder:text-muted"
      />
    </section>
  )
}
