import { createCachedMetadata } from './cache'
import { createMockSource } from './mock'
import type { MetadataSource } from './source'

/** Single swap point: replace with a Supabase-backed source once the backend exists. */
export const metadata: MetadataSource = createMockSource()

/** Cache-first wrapper the UI talks to (seasons and details are stored in IndexedDB). */
export const meta = createCachedMetadata(metadata)
