/** Parse "1:12" (h:mm) or "72" (minutes) → minutes. Returns null if invalid. */
export function parseHm(input: string): number | null {
  const s = input.trim()
  if (!s) return null
  const m = /^(\d{1,2}):([0-5]?\d)$/.exec(s)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  if (/^\d{1,3}$/.test(s)) return Number(s)
  return null
}

export function formatHm(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}:${String(m).padStart(2, '0')}`
}
