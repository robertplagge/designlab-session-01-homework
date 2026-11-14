import type { MediaType } from './types'

export const titleId = (type: MediaType, tmdbId: number) => `${type}:${tmdbId}`

export function parseTitleId(id: string): { type: MediaType; tmdbId: number } | null {
  const [type, raw] = id.split(':')
  const tmdbId = Number(raw)
  if ((type !== 'movie' && type !== 'tv') || !Number.isInteger(tmdbId)) return null
  return { type, tmdbId }
}

export const seasonKey = (id: string, season: number) => `${id}:s${season}`

/** crypto.randomUUID is missing on insecure origins (e.g. http://192.168.x.x on a phone). */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes)
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
  return `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10).join('')}`
}
