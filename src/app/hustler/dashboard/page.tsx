'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, MapPin, IndianRupee, Zap, Power, FileText } from 'lucide-react'
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

export default function HustlerDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [hustler, setHustler] = useState<any>(null)
  const [isActive, setIsActive] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [briefs, setBriefs] = useState<any[]>([])
  const [stats, setStats] = useState({ applied: 0, matched: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const [{ data: p }, { data: h }, { data: b }, { data: appliedMatches }, { data: acceptedMatches }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('hustlers').select('*').eq('id', user.id).single(),
        supabase.from('briefs').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(30),
        supabase.from('matches').select('id', { count: 'exact' }).eq('hustler_id', user.id),
        supabase.from('matches').select('id', { count: 'exact' }).eq('hustler_id', user.id).eq('status', 'accepted'),
      ])

      if (p) setProfile(p)
      if (h) { setHustler(h); setIsActive(h.is_active) }
      if (b) {
        const hustlerSkills = parseSkills(h?.skill || '')
        const filtered = hustlerSkills.length > 0
          ? b.filter((brief: any) => hustlerSkills.includes(brief.skill))
          : b
        setBriefs(filtered)
      }
      setStats({
        applied: appliedMatches?.length ?? 0,
        matched: acceptedMatches?.length ?? 0,
      })
      setLoading(false)
    }

    init()

    // Live: new briefs appear instantly
    const channel = supabase
      .channel('briefs-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'briefs' }, (payload) => {
        setBriefs((prev) => [payload.new as any, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  const toggleActive = async () => {
    setToggling(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setToggling(false); return }
    const next = !isActive
    await supabase.from('hustlers').update({ is_active: next }).eq('id', user.id)
    setIsActive(next)
    setToggling(false)
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

      <main style={{ paddingTop: 72, paddingBottom: 16, padding: '72px 16px 16px', maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
              Hey {profile?.name?.split(' ')[0] || 'Hustler'} 👋
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {isActive ? "You're visible to founders" : 'Go active to receive match requests'}
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleActive}
            disabled={toggling}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s',
              background: isActive ? 'rgba(34,197,94,0.12)' : 'var(--bg-muted)',
              border: `1.5px solid ${isActive ? '#22c55e' : 'var(--border)'}`,
              color: isActive ? '#22c55e' : 'var(--text-muted)',
            }}
          >
            {toggling
              ? <div style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <Power size={16} />
            }
            {isActive ? 'Active' : 'Go Active'}
            {isActive && <span className="live-dot" style={{ marginLeft: 2 }} />}
          </motion.button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Applied', value: stats.applied },
            { label: 'Matched', value: stats.matched },
            { label: 'Skill', value: hustler?.skill?.split(' ')[0] || '—' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Briefs feed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileText size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Live Briefs</span>
          <span className="live-dot" style={{ marginLeft: 4 }} />
          {parseSkills(hustler?.skill || '').length > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99,
              background: 'var(--primary-soft)', color: 'var(--primary)',
            }}>
              Matching your skills
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-subtle)', marginLeft: 'auto' }}>{briefs.length} active</span>
        </div>

        {briefs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>No briefs posted yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Go active and check back soon</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {briefs.map((brief, i) => (
              <motion.div
                key={brief.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card"
                style={{ padding: 16, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{brief.title}</span>
                      {brief.urgency === 'Urgent' && (
                        <span className="badge badge-red" style={{ fontSize: 11, padding: '2px 7px', gap: 4 }}>
                          <Zap size={10} /> Urgent
                        </span>
                      )}
                    </div>
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
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 16, color: '#16a34a' }}>
                      <IndianRupee size={13} />{brief.budget.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav role="hustler" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
