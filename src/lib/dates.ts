const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }

export const nowIso = () => new Date().toISOString()

export function formatDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, opts)
}

/** Value for <input type="date"> in local time. */
export function toDateInput(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** From <input type="date"> to ISO; keeps current time-of-day so ordering within a day is stable. */
export function fromDateInput(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  const now = new Date()
  if (!y || !m || !d) return now.toISOString()
  return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString()
}
