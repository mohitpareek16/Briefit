'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Phone, MessageCircle, Check, ArrowLeft, Users } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { createClient } from '@/lib/supabase/client'

function parseSkills(raw: string): string[] {
  if (!raw) return []
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [raw] } catch { return [raw] }
}

const STEPS = ['Scanning profiles...', 'Analyzing skills...', 'Ranking by availability...', 'Done!']
const AVATAR_BG = ['#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ea580c', '#2563eb', '#b45309']

function SpinnerRings() {
  return (
    <div style={{ position: 'relative', width: 128, height: 128, margin: '0 auto' }}>
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 2 + i, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: i * 10, borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: i === 0 ? 'var(--primary)' : i === 1 ? '#a78bfa' : '#c4b5fd',
          }}
        />
      ))}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: 'var(--primary-soft)' }}
        >
          🧠
        </motion.div>
      </div>
    </div>
  )
}

function MatchingContent() {
  const searchParams = useSearchParams()
  const briefId = searchParams.get('brief_id')

  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [brief, setBrief] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [startupName, setStartupName] = useState('Your Startup')

  useEffect(() => {
    const supabase = createClient()

    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: e }, { data: b }] = await Promise.all([
        supabase.from('entrepreneurs').select('startup_name').eq('id', user.id).single(),
        briefId ? supabase.from('briefs').select('*').eq('id', briefId).single() : Promise.resolve({ data: null }),
      ])

      if (e?.startup_name) setStartupName(e.startup_name)
      if (b) {
        setBrief(b)
        // Find hustlers with matching skill who are active
        const { data: hustlersData } = await supabase
          .from('hustlers')
          .select('id, skill, is_active, rating, completed_briefs, profiles(name, location, mobile)')
          .order('is_active', { ascending: false })
          .order('rating', { ascending: false })
          .limit(10)

        const allHustlers = hustlersData || []
        const hustlers = allHustlers.filter((h: any) => parseSkills(h.skill).includes(b.skill))
        setMatches(hustlers)
      }
    }

    loadData()

    // Animate matching steps
    const total = 3500
    const stepDur = total / STEPS.length
    STEPS.forEach((_, i) => setTimeout(() => setStep(i), i * stepDur))
    const interval = setInterval(() => setProgress((p) => Math.min(p + 1, 100)), total / 100)
    const timer = setTimeout(() => { setDone(true); clearInterval(interval) }, total + 400)

    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [briefId])

  const waLink = (name: string, phone: string) => {
    const msg = encodeURIComponent(
      `Hi ${name}, I'm a founder at ${startupName}. I found your profile on Briefit and I'd love to discuss a brief${brief?.title ? ` — "${brief.title}"` : ''}. Are you available for a quick chat?`
    )
    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40, background: 'var(--bg)' }}>
      <NavBar showLogout />

      <main style={{ paddingTop: 72, padding: '72px 16px 40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 720, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', width: '100%', maxWidth: 320 }}>
              <SpinnerRings />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 24, marginBottom: 8 }}>
                Making the perfect match...
              </h2>
              <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'var(--bg-muted)', marginBottom: 20, overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', borderRadius: 99, width: `${progress}%`, background: 'var(--primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STEPS.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i < step ? '#22c55e' : i === step ? 'var(--primary)' : 'var(--bg-muted)',
                      transition: 'all 0.3s',
                    }}>
                      {i < step && <Check size={10} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{ color: i <= step ? 'var(--text)' : 'var(--text-subtle)' }}>{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }} style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  style={{ width: 56, height: 56, borderRadius: 16, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={26} color="#fff" strokeWidth={3} />
                </motion.div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  {matches.length > 0 ? `${matches.length} Match${matches.length > 1 ? 'es' : ''} Found!` : 'No Matches Yet'}
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {matches.length > 0
                    ? 'Reach out directly — hustlers are waiting to hear from you.'
                    : `No active ${brief?.skill || ''} hustlers right now. Check back soon or post with a different skill.`}
                </p>
              </div>

              {matches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                  <Link href="/entrepreneur/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>
                    Back to Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
                    {matches.map((m, i) => {
                      const pname = (m.profiles as any)?.name || 'Hustler'
                      const plocation = (m.profiles as any)?.location || '—'
                      const pmobile = (m.profiles as any)?.mobile || ''
                      return (
                        <motion.div key={m.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="card"
                          style={{ padding: 16 }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, color: '#fff', fontSize: 18,
                              background: AVATAR_BG[i % AVATAR_BG.length],
                            }}>
                              {pname[0]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{pname}</span>
                                {m.is_active
                                  ? <span className="badge badge-green" style={{ fontSize: 10, padding: '2px 6px' }}>Live</span>
                                  : <span className="badge badge-gray" style={{ fontSize: 10, padding: '2px 6px' }}>Away</span>
                                }
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-subtle)', marginTop: 2 }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{m.skill}</span>
                                <span>·</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{plocation}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, fontSize: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}>
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} size={11} style={{ fill: j < Math.floor(Number(m.rating)) ? '#f59e0b' : 'none' }} />
                              ))}
                              <span style={{ marginLeft: 4, color: 'var(--text-muted)' }}>{Number(m.rating).toFixed(1)}</span>
                            </div>
                            <span style={{ color: 'var(--text-subtle)' }}>{m.completed_briefs} completed</span>
                          </div>

                          {pmobile ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <a href={waLink(pname, pmobile)} target="_blank" rel="noopener noreferrer"
                                className="btn btn-sm"
                                style={{ flex: 1, gap: 6, background: '#22c55e', color: '#fff', border: 'none', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MessageCircle size={13} /> WhatsApp
                              </a>
                              <a href={`tel:+91${pmobile}`}
                                className="btn btn-primary btn-sm"
                                style={{ flex: 1, gap: 6, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Phone size={13} /> Call
                              </a>
                            </div>
                          ) : (
                            <p style={{ fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', padding: '6px 0' }}>Contact not shared yet</p>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <Link href="/entrepreneur/dashboard" className="btn btn-ghost" style={{ gap: 6, display: 'inline-flex', fontSize: 13 }}>
                      <ArrowLeft size={15} /> Back to Dashboard
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function MatchingPage() {
  return <Suspense><MatchingContent /></Suspense>
}
