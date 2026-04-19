'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const role = searchParams.get('role') || 'hustler'

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || !session) {
        // Try exchanging the code manually if present in URL
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          const { data, error: exchErr } = await supabase.auth.exchangeCodeForSession(code)
          if (exchErr || !data.session) {
            router.push('/auth?error=auth_failed')
            return
          }
          await redirect(supabase, data.session.user.id, role, router)
        } else {
          router.push('/auth?error=auth_failed')
        }
        return
      }
      await redirect(supabase, session.user.id, role, router)
    })
  }, [router, searchParams])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Zap size={24} color="#fff" strokeWidth={2.5} />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Signing you in...</p>
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

async function redirect(supabase: any, userId: string, role: string, router: any) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarded')
    .eq('id', userId)
    .single()

  if (!profile || !profile.onboarded) {
    router.push(`/onboarding/${role}`)
  } else {
    router.push(profile.role === 'hustler' ? '/hustler/dashboard' : '/entrepreneur/dashboard')
  }
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  )
}
