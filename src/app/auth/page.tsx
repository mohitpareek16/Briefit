'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ThemeToggle'

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get('role') || 'hustler'
  const error = searchParams.get('error')
  const [loading, setLoading] = useState(false)
  const isHustler = role === 'hustler'

  const handleGoogleAuth = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Briefit</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Body */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{ width: '100%', maxWidth: 360 }}
        >
          {/* Role pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <span className="badge badge-purple" style={{ fontSize: 12, padding: '5px 14px' }}>
              {isHustler ? '⚡ Joining as a Hustler' : '🚀 Joining as an Entrepreneur'}
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', textAlign: 'center', marginBottom: 8 }}>
            Welcome to Briefit
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
            {isHustler
              ? 'Sign in to discover live briefs and get matched with founders.'
              : 'Sign in to find the perfect freelancer for your brief.'}
          </p>

          {error && (
            <div className="badge-red" style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 20, textAlign: 'center', fontSize: 13, border: '1px solid rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.08)', color: 'var(--danger)' }}>
              Authentication failed. Please try again.
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="btn btn-full"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 20px', fontSize: 15, borderRadius: 12 }}
          >
            {loading ? (
              <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', marginTop: 20 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Want to join as {isHustler ? 'an Entrepreneur' : 'a Hustler'} instead?{' '}
            </span>
            <button
              onClick={() => router.push(`/auth?role=${isHustler ? 'entrepreneur' : 'hustler'}`)}
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Switch
            </button>
          </div>
        </motion.div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AuthPage() {
  return <Suspense><AuthContent /></Suspense>
}
