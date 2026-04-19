'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    const role = searchParams.get('role') || localStorage.getItem('briefit_role') || 'hustler'

    const handleSession = async (userId: string) => {
      if (handled.current) return
      handled.current = true

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarded')
          .eq('id', userId)
          .single()

        if (!profile || !profile.onboarded) {
          router.replace(`/onboarding/${role}`)
        } else {
          router.replace(profile.role === 'hustler' ? '/hustler/dashboard' : '/entrepreneur/dashboard')
        }
      } catch {
        router.replace(`/onboarding/${role}`)
      }
    }

    // 1. Subscribe to auth changes first (handles PKCE auto-exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        handleSession(session.user.id)
      }
    })

    // 2. Also check if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleSession(session.user.id)
    })

    // 3. Fallback: manually exchange code if present in URL
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session?.user) {
          handleSession(data.session.user.id)
        }
      })
    }

    // 4. Timeout after 12s
    const timeout = setTimeout(() => {
      if (!handled.current) {
        handled.current = true
        router.replace('/auth?error=auth_failed')
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
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Zap size={24} color="#fff" strokeWidth={2.5} />
      </div>
      <p style={{ color: 'var(--text)', fontSize: 16, fontWeight: 600 }}>Signing you in...</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Please wait a moment</p>
      <div style={{ width: 28, height: 28, border: '2.5px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function CallbackPage() {
  return <Suspense><CallbackContent /></Suspense>
}
