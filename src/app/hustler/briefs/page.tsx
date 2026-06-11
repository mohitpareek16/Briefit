'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, IndianRupee, Zap, FileText, Check, CalendarClock } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

function parseSkills(raw: string): string[] {
  if (!raw) return []
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [raw] } catch { return [raw] }
}

const SKILL_COLORS: Record<string, string> = {
  Development: '#7c3aed', Design: '#0891b2', 'Content Writing': '#16a34a',
  'Social Media': '#db2777', 'Video Editing': '#ea580c', Marketing: '#2563eb',
  Finance: '#b45309', Legal: '#6b21a8', Other: '#475569',
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

export default function HustlerBriefs() {
  const router = useRouter()
  const [briefs, setBriefs] = useState<any[]>([])
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [applying, setApplying] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [hustler, setHustler] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const [{ data: b }, { data: m }, { data: h }] = await Promise.all([
        supabase.from('briefs').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(50),
        supabase.from('matches').select('brief_id').eq('hustler_id', user.id),
        supabase.from('hustlers').select('skill').eq('id', user.id).single(),
      ])

      if (h) setHustler(h)
      if (m) setApplied(new Set(m.map((x: any) => x.brief_id)))
      if (b) {
        const hustlerSkills = parseSkills(h?.skill || '')
        const filtered = hustlerSkills.length > 0
          ? b.filter((brief: any) => hustlerSkills.includes(brief.skill))
          : b
        setBriefs(filtered)
      }
      setLoading(false)
    }

    init()

    const channel = supabase
      .channel('briefs-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'briefs' }, (payload) => {
        const newBrief = payload.new as any
        setBriefs((prev) => {
          const hustlerSkills = parseSkills(hustler?.skill || '')
          if (hustlerSkills.length > 0 && !hustlerSkills.includes(newBrief.skill)) return prev
          return [newBrief, ...prev]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  const handleApply = async (briefId: string) => {
    if (!userId || applied.has(briefId)) return
    setApplying(briefId)
    const supabase = createClient()
    const { error } = await supabase.from('matches').insert({
      brief_id: briefId,
      hustler_id: userId,
      status: 'pending',
    })
    if (!error) {
      setApplied((prev) => { const s = new Set(Array.from(prev)); s.add(briefId); return s })
    }
    setApplying(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout />

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>All Briefs</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{briefs.length} active right now</p>
            {parseSkills(hustler?.skill || '').length > 0 && (
              <p style={{ fontSize: 11, color: 'var(--primary)', marginTop: 2 }}>
                Showing briefs matching: {parseSkills(hustler?.skill || '').join(', ')}
              </p>
            )}
          </div>
          <span className="live-dot" style={{ marginLeft: 8 }} />
        </div>

        {briefs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-subtle)' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>No briefs posted yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Check back soon — founders are joining every day</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {briefs.map((brief, i) => {
                const isApplied = applied.has(brief.id)
                const isApplying = applying === brief.id
                return (
                  <motion.div
                    key={brief.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="card"
                    style={{ padding: 16 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{brief.title}</span>
                          {brief.urgency === 'Urgent' && (
                            <span className="badge badge-red" style={{ fontSize: 11, padding: '2px 7px', gap: 4 }}>
                              <Zap size={10} /> Urgent
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                          {brief.description?.length > 120 ? brief.description.slice(0, 120) + '…' : brief.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 6,
                            background: `${SKILL_COLORS[brief.skill] || '#475569'}18`,
                            color: SKILL_COLORS[brief.skill] || '#475569',
                            border: `1px solid ${SKILL_COLORS[brief.skill] || '#475569'}30`,
                          }}>{brief.skill}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-subtle)' }}>
                            <MapPin size={11} />{brief.location_pref}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-subtle)' }}>
                            <Clock size={11} />{timeAgo(brief.created_at)}
                          </span>
                          {brief.deadline && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--primary)' }}>
                              <CalendarClock size={11} />{brief.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 16, color: '#16a34a' }}>
                          <IndianRupee size={13} />{brief.budget.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApply(brief.id)}
                      disabled={isApplied || isApplying}
                      className={isApplied ? 'btn btn-sm' : 'btn btn-primary btn-sm'}
                      style={{
                        width: '100%',
                        gap: 6,
                        background: isApplied ? 'rgba(34,197,94,0.1)' : undefined,
                        border: isApplied ? '1px solid #22c55e' : undefined,
                        color: isApplied ? '#16a34a' : undefined,
                      }}
                    >
                      {isApplying
                        ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        : isApplied
                        ? <><Check size={13} /> Interest Sent</>
                        : 'Express Interest'
                      }
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <BottomNav role="hustler" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
