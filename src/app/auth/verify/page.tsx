'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap } from 'lucide-react'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const serverHint = searchParams.get('hint') // error hint from Route Handler

    const supabase = createClient()

    const goTo = async (userId: string) => {
      if (handled.current) return
      handled.current = true
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarded')
          .eq('id', userId)
          .single()

        if (!profile || !profile.onboarded) {
          const role = localStorage.getItem('briefit_role') ||
            document.cookie.match(/briefit_role=([^;]+)/)?.[1] || 'hustler'
          router.replace(`/onboarding/${role}`)
        } else {
          router.replace(`/${profile.role}/dashboard`)
        }
      } catch {
        const role = localStorage.getItem('briefit_role') || 'hustler'
        router.replace(`/onboarding/${role}`)
      }
    }

    // Strategy 1: explicit browser-side code exchange (can access PKCE verifier from document.cookie)
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session?.user) {
          goTo(data.session.user.id)
        } else if (error) {
          // Both server AND client exchange failed — show the actual error
          const clientErr = encodeURIComponent(error.message)
          const serverErr = serverHint ? `+server:+${serverHint}` : ''
          router.replace(`/auth?error=${clientErr}${serverErr}`)
        }
      })
    }

    // Strategy 2: onAuthStateChange fires if the browser client auto-exchanged (detectSessionInUrl)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        goTo(session.user.id)
      }
    })

    // Strategy 3: session might already be established
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) goTo(session.user.id)
    })

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!handled.current) {
        handled.current = true
        const hint = serverHint ? encodeURIComponent(`timeout (server hint: ${serverHint})`) : 'auth_timeout'
        router.replace(`/auth?error=${hint}`)
      }
    }, 12000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router, searchParams])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Zap size={24} color="#fff" strokeWidth={2.5} />
      </div>
      <p style={{ color: 'var(--text)', fontSize: 16, fontWeight: 600 }}>Signing you in...</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Please wait a moment</p>
      <div style={{
        width: 28, height: 28,
        border: '2.5px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>
}
