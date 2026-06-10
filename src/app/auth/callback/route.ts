import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hxwwkhthrswpedyqqujm.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4d3draHRocnN3cGVkeXFxdWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODM5OTQsImV4cCI6MjA5MjE1OTk5NH0.HNiWLEh9jyo5KvWIblwcaliAHH_nYwJ_20RpkxE9sQg'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    // No code in URL — may be implicit flow (tokens in hash), hand off to client
    return NextResponse.redirect(`${origin}/auth/verify`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Pass actual error to client so we can see what's failing
    const msg = encodeURIComponent(`${error.code ?? 'exchange_error'}: ${error.message}`)
    // Also try client-side exchange as fallback (passes code to client page)
    return NextResponse.redirect(`${origin}/auth/verify?code=${encodeURIComponent(code)}&hint=${msg}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarded')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.onboarded) {
      const role = cookieStore.get('briefit_role')?.value || 'hustler'
      return NextResponse.redirect(`${origin}/onboarding/${role}`)
    }
    return NextResponse.redirect(`${origin}/${profile.role}/dashboard`)
  }

  return NextResponse.redirect(`${origin}/auth?error=no_user_after_exchange`)
}
