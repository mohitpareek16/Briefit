'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Rocket, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { InstallPWA } from '@/components/InstallPWA'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter()

  // Auto-redirect if already logged in
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarded')
        .eq('id', data.user.id)
        .single()
      if (profile?.onboarded) {
        router.replace(`/${profile.role}/dashboard`)
      }
    })
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <InstallPWA />

      <header style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Briefit</span>
        </div>
        <ThemeToggle />
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <span className="badge badge-purple" style={{ marginBottom: 28, display: 'inline-flex' }}>
            <span className="live-dot" />
            Match founders with freelancers — instantly
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
          style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.15, color: 'var(--text)', marginBottom: 16, maxWidth: 640 }}
        >
          Where{' '}<span className="gradient-text">Hustle</span>{' '}Meets{' '}<span className="gradient-text">Vision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}
          style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, marginBottom: 52, lineHeight: 1.7 }}
        >
          The fastest matching platform connecting skilled freelancers with ambitious founders. Post a brief, get matched in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, width: '100%', maxWidth: 580, marginBottom: 40 }}
        >
          <Link href="/auth?role=hustler" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} className="card card-hover"
              style={{ padding: '28px 24px', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Zap size={22} color="var(--primary)" strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Join as a Hustler</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 20 }}>
                Freelancers & skilled professionals. Get matched with founders who need your expertise — fast.
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                Start Hustling <ArrowRight size={14} />
              </span>
            </motion.div>
          </Link>

          <Link href="/auth?role=entrepreneur" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} className="card card-hover"
              style={{ padding: '28px 24px', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Rocket size={22} color="var(--primary)" strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Join as an Entrepreneur</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 20 }}>
                Founders & builders. Post your brief and get matched with the perfect freelancer within minutes.
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                Post a Brief <ArrowRight size={14} />
              </span>
            </motion.div>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
