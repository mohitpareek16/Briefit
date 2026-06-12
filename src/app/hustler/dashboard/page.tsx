'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, IndianRupee, Zap, Power, FileText, X, Check, CalendarClock, Building2 } from 'lucide-react'
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

function BriefModal({ brief, applied, applying, onApply, onClose, entrepreneurInfo, canDismiss, onDismiss }: {
  brief: any; applied: boolean; applying: boolean; onApply: () => void; onClose: () => void
  entrepreneurInfo: any; canDismiss: boolean; onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: 640, padding: '20px 20px 40px',
          maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        {entrepreneurInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-muted)', marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
              {((entrepreneurInfo?.profiles as any)?.name || 'E')[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{(entrepreneurInfo?.profiles as any)?.name || 'Founder'}</p>
              {entrepreneurInfo?.startup_name && (
                <p style={{ fontSize: 11, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Building2 size={10} />{entrepreneurInfo.startup_name}
                </p>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{brief.title}</h2>
              {brief.urgency === 'Urgent' && (
                <span className="badge badge-red" style={{ fontSize: 11, padding: '2px 7px', gap: 4 }}>
                  <Zap size={10} /> Urgent
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 6,
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
          <button onClick={onClose} style={{ background: 'var(--bg-muted)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', marginLeft: 12, flexShrink: 0 }}>
            <X size={16} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-muted)', marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>{brief.description}</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-muted)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 700, fontSize: 18, color: '#16a34a' }}>
              <IndianRupee size={14} />{brief.budget.toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Budget</p>
          </div>
          {brief.deadline && (
            <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-muted)', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                <CalendarClock size={14} color="var(--primary)" />{brief.deadline}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Timeline</p>
            </div>
          )}
        </div>

        <button
          onClick={onApply}
          disabled={applied || applying}
          className={applied ? 'btn btn-sm' : 'btn btn-primary btn-sm'}
          style={{
            width: '100%', gap: 6, padding: '13px 20px', fontSize: 14,
            background: applied ? 'rgba(34,197,94,0.1)' : undefined,
            border: applied ? '1px solid #22c55e' : undefined,
            color: applied ? '#16a34a' : undefined,
          }}
        >
          {applying
            ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : applied
            ? <><Check size={15} /> Interest Sent</>
            : 'Express Interest'
          }
        </button>
        {canDismiss && (
          <button
            onClick={onDismiss}
            className="btn btn-sm"
            style={{ width: '100%', marginTop: 10, gap: 6, padding: '11px 20px', fontSize: 13, color: 'var(--text-muted)' }}
          >
            Not Interested
          </button>
        )}
      </motion.div>
    </motion.div>
  )
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
  const [userId, setUserId] = useState<string | null>(null)
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [applying, setApplying] = useState(false)
  const [selectedBrief, setSelectedBrief] = useState<any>(null)
  const [entrepreneurInfo, setEntrepreneurInfo] = useState<any>(null)

  useEffect(() => {
    if (!selectedBrief?.entrepreneur_id) { setEntrepreneurInfo(null); return }
    const supabase = createClient()
    supabase.from('entrepreneurs').select('startup_name, profiles(name)').eq('id', selectedBrief.entrepreneur_id).single()
      .then(({ data }) => setEntrepreneurInfo(data))
  }, [selectedBrief?.entrepreneur_id])

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const [{ data: p }, { data: h }, { data: b }, { data: appliedMatches }, { data: acceptedMatches }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('hustlers').select('*').eq('id', user.id).single(),
        supabase.from('briefs').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(30),
        supabase.from('matches').select('brief_id, status').eq('hustler_id', user.id),
        supabase.from('matches').select('id').eq('hustler_id', user.id).eq('status', 'accepted'),
      ])

      if (p) setProfile(p)
      if (h) { setHustler(h); setIsActive(h.is_active) }
      if (appliedMatches) {
        setApplied(new Set(appliedMatches.filter((m: any) => m.status !== 'dismissed').map((m: any) => m.brief_id)))
        setDismissed(new Set(appliedMatches.filter((m: any) => m.status === 'dismissed').map((m: any) => m.brief_id)))
        setStats({ applied: appliedMatches.filter((m: any) => m.status !== 'dismissed').length, matched: acceptedMatches?.length ?? 0 })
      }
      if (b) {
        const hustlerSkills = parseSkills(h?.skill || '')
        const dismissedSet = new Set(
          (appliedMatches || []).filter((m: any) => m.status === 'dismissed').map((m: any) => m.brief_id)
        )
        const filtered = hustlerSkills.length > 0
          ? b.filter((brief: any) => hustlerSkills.includes(brief.skill) && !dismissedSet.has(brief.id))
          : b.filter((brief: any) => !dismissedSet.has(brief.id))
        setBriefs(filtered)
      }
      setLoading(false)
    }

    init()

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

  const handleApply = async (briefId: string) => {
    if (!userId || applied.has(briefId) || applying) return
    setApplying(true)
    const supabase = createClient()
    const { error } = await supabase.from('matches').insert({ brief_id: briefId, hustler_id: userId, status: 'pending' })
    if (!error) {
      setApplied((prev) => { const s = new Set(Array.from(prev)); s.add(briefId); return s })
      setStats((st) => ({ ...st, applied: st.applied + 1 }))
    }
    setApplying(false)
  }

  const handleDismiss = async (briefId: string) => {
    if (!userId || applied.has(briefId) || dismissed.has(briefId)) return
    const supabase = createClient()
    await supabase.from('matches').insert({ brief_id: briefId, hustler_id: userId, status: 'dismissed' })
    setDismissed((prev) => { const s = new Set(Array.from(prev)); s.add(briefId); return s })
    setBriefs((prev) => prev.filter((b) => b.id !== briefId))
    setSelectedBrief(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const mySkills = parseSkills(hustler?.skill || '')
  const skillLabel = mySkills.length === 0 ? '—'
    : mySkills.length === 1 ? mySkills[0]
    : `${mySkills.length} Skills`

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout />

      <AnimatePresence>
        {selectedBrief && (
          <BriefModal
            brief={selectedBrief}
            applied={applied.has(selectedBrief.id)}
            applying={applying}
            onApply={() => handleApply(selectedBrief.id)}
            onClose={() => setSelectedBrief(null)}
            entrepreneurInfo={entrepreneurInfo}
            canDismiss={!applied.has(selectedBrief.id)}
            onDismiss={() => handleDismiss(selectedBrief.id)}
          />
        )}
      </AnimatePresence>

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
            { label: mySkills.length > 1 ? 'Skills' : 'Skill', value: skillLabel },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: typeof s.value === 'string' && s.value.length > 6 ? 12 : 18, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Briefs feed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileText size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Live Briefs</span>
          <span className="live-dot" style={{ marginLeft: 4 }} />
          {mySkills.length > 0 && (
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
                style={{ padding: 16, cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedBrief(brief)}
              >
                {!applied.has(brief.id) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDismiss(brief.id) }}
                    style={{
                      position: 'absolute', top: 10, right: 10, zIndex: 2,
                      background: 'var(--bg-muted)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: 4, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Not Interested"
                  >
                    <X size={12} color="var(--text-muted)" />
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{brief.title}</span>
                      {brief.urgency === 'Urgent' && (
                        <span className="badge badge-red" style={{ fontSize: 11, padding: '2px 7px', gap: 4 }}>
                          <Zap size={10} /> Urgent
                        </span>
                      )}
                      {applied.has(brief.id) && (
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={11} /> Sent
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
                    <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 3 }}>tap to open</p>
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
