import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Null until both env vars are set; the app then simply runs signed-out and local-only. */
export const supabase = url && key ? createClient(url, key) : null
export const authConfigured = supabase !== null
