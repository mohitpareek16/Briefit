import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has already onboarded
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarded')
          .eq('id', user.id)
          .single()

        if (!profile || !profile.onboarded) {
          // New user — need to figure out role. Check URL param stored in cookie
          const role = searchParams.get('role') || 'hustler'
          return NextResponse.redirect(`${origin}/onboarding/${role}`)
        }

        if (profile.role === 'hustler') {
          return NextResponse.redirect(`${origin}/hustler/dashboard`)
        } else {
          return NextResponse.redirect(`${origin}/entrepreneur/dashboard`)
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
