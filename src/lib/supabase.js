import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  if (import.meta.env.MODE !== 'test') {
    throw new Error('Missing Supabase env vars')
  }
}

export const supabase = url && key ? createClient(url, key) : null
