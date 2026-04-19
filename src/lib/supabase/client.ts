import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hxwwkhthrswpedyqqujm.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Ik496HnRoVKfUDtv6haBdQ_tW74-qqS'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}
