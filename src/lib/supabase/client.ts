import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://hxwwkhthrswpedyqqujm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4d3draHRocnN3cGVkeXFxdWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODM5OTQsImV4cCI6MjA5MjE1OTk5NH0.HNiWLEh9jyo5KvWIblwcaliAHH_nYwJ_20RpkxE9sQg'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}
