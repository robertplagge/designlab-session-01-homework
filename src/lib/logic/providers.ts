import { SERVICES, type Service } from '../types'

const MAP: [RegExp, Service][] = [
  [/netflix/i, 'Netflix'],
  [/(amazon|prime)/i, 'Prime Video'],
  [/disney/i, 'Disney+'],
  [/apple\s*tv/i, 'Apple TV+'],
  [/(wow|sky)/i, 'WOW/Sky'],
]

/** Map a TMDB watch-provider name to one of the app's service tags. */
export function normalizeProvider(name: string): Service {
  return MAP.find(([re]) => re.test(name))?.[1] ?? 'Other'
}

/** Unique, ordered service suggestions; "Other" is dropped unless nothing else matches. */
export function suggestServices(providerNames: string[] = []): Service[] {
  const set = new Set(providerNames.map(normalizeProvider))
  const known = SERVICES.filter((s) => s !== 'Other' && set.has(s))
  return known
}
