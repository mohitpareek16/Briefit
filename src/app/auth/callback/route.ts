import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hxwwkhthrswpedyqqujm.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Ik496HnRoVKfUDtv6haBdQ_tW74-qqS'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
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
    if (!error) {
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
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
