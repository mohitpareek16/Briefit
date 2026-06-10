'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, IndianRupee, Clock, Zap, Plus, ChevronDown, ChevronUp, MessageCircle, Phone, Star, MapPin, X, Bell, Check, Users } from 'lucide-react'
import Link from 'next/link'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

const SKILL_COLORS: Record<string, string> = {
  Development: '#7c3aed', Design: '#0891b2', 'Content Writing': '#16a34a',
  'Social Media': '#db2777', 'Video Editing': '#ea580c', Marketing: '#2563eb',
  Finance: '#b45309', Legal: '#6b21a8', Other: '#475569',
}

const AVATAR_BG = ['#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ea580c', '#2563eb', '#b45309']

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
        background: '#22c55e', color: '#fff',
        padding: '11px 16px', borderRadius: 14, fontSize: 13, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 10, zIndex: 200,
        boxShadow: '0 4px 24px rgba(34,197,94,0.35)',
        maxWidth: 340, width: 'calc(100vw - 32px)',
      }}
    >
      <Bell size={15} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}>
        <X size={14} />
      </button>
    </motion.div>
  )
}

export default function EntrepreneurBriefs() {
  const router = useRouter()
  const [briefs, setBriefs] = useState<any[]>([])
  const [interests, setInterests] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [startupName, setStartupName] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const [{ data: e }, { data: b }] = await Promise.all([
        supabase.from('entrepreneurs').select('startup_name').eq('id', user.id).single(),
        supabase.from('briefs').select('*').eq('entrepreneur_id', user.id).order('created_at', { ascending: false }),
      ])

      if (e?.startup_name) setStartupName(e.startup_name)
      const myBriefs = b || []
      setBriefs(myBriefs)

      if (myBriefs.length > 0) {
        const ids = myBriefs.map((x: any) => x.id)

        const { data: m } = await supabase
          .from('matches')
          .select('id, brief_id, status, created_at, hustler_id, hustlers(skill, rating, is_active, profiles(name, location, mobile))')
          .in('brief_id', ids)
          .order('created_at', { ascending: false })

        if (m) {
          const grouped: Record<string, any[]> = {}
          m.forEach((match: any) => {
            if (!grouped[match.brief_id]) grouped[match.brief_id] = []
            grouped[match.brief_id].push(match)
          })
          setInterests(grouped)
        }

        // Real-time: new interest notification
        channel = supabase.channel('entrepreneur-interests')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, async (payload) => {
            const newMatch = payload.new as any
            if (!ids.includes(newMatch.brief_id)) return

            const { data: h } = await supabase
              .from('hustlers')
              .select('skill, rating, is_active, profiles(name, location, mobile)')
              .eq('id', newMatch.hustler_id)
              .single()

            if (h) {
              const withProfile = { ...newMatch, hustlers: h }
              setInterests((prev) => {
                const updated = { ...prev }
                updated[newMatch.brief_id] = [withProfile, ...(updated[newMatch.brief_id] || [])]
                return updated
              })
              const hName = (h.profiles as any)?.name || 'A hustler'
              const brief = myBriefs.find((x: any) => x.id === newMatch.brief_id)
              setToast(`${hName} is interested in "${brief?.title || 'your brief'}"`)
              // Auto-expand the brief that got new interest
              setExpanded(newMatch.brief_id)
            }
          })
          .subscribe()
      }

      setLoading(false)
    }

    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [router])

  const updateMatchStatus = async (matchId: string, status: 'accepted' | 'rejected') => {
    setActionId(matchId)
    const supabase = createClient()
    await supabase.from('matches').update({ status }).eq('id', matchId)
    setInterests((prev) => {
      const updated: Record<string, any[]> = {}
      Object.keys(prev).forEach((bid) => {
        updated[bid] = prev[bid].map((m) => m.id === matchId ? { ...m, status } : m)
      })
      return updated
    })
    setActionId(null)
  }

  const handleClose = async (briefId: string) => {
    const supabase = createClient()
    await supabase.from('briefs').update({ status: 'closed' }).eq('id', briefId)
    setBriefs((prev) => prev.map((b) => b.id === briefId ? { ...b, status: 'closed' } : b))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const statusStyle = (status: string) => {
    if (status === 'active') return { color: '#16a34a', bg: 'rgba(34,197,94,0.1)', text: 'Active' }
    if (status === 'matched') return { color: '#2563eb', bg: 'rgba(37,99,235,0.1)', text: 'Matched' }
    return { color: 'var(--text-muted)', bg: 'var(--bg-muted)', text: 'Closed' }
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout />

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="var(--primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>My Briefs</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{briefs.length} posted</p>
            </div>
          </div>
          <Link href="/entrepreneur/post-brief" className="btn btn-primary btn-sm"
            style={{ gap: 6, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Plus size={14} /> New Brief
          </Link>
        </div>

        {briefs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-subtle)' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>No briefs posted yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Post your first brief to find a hustler</p>
            <Link href="/entrepreneur/post-brief" className="btn btn-primary"
              style={{ display: 'inline-flex', marginTop: 16, gap: 6, textDecoration: 'none' }}>
              <Plus size={15} /> Post a Brief
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {briefs.map((brief, i) => {
              const s = statusStyle(brief.status)
              const briefInterests = interests[brief.id] || []
              const pendingCount = briefInterests.filter((m) => m.status === 'pending').length
              const isExpanded = expanded === brief.id

              return (
                <motion.div key={brief.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card" style={{ padding: 16 }}>

                  {/* Brief header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{brief.title}</span>
                        {brief.urgency === 'Urgent' && (
                          <span className="badge badge-red" style={{ fontSize: 10, padding: '2px 6px', gap: 3 }}>
                            <Zap size={9} /> Urgent
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                        {brief.description?.length > 100 ? brief.description.slice(0, 100) + '…' : brief.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
                        <span style={{
                          fontWeight: 500, padding: '2px 8px', borderRadius: 6,
                          background: `${SKILL_COLORS[brief.skill] || '#475569'}18`,
                          color: SKILL_COLORS[brief.skill] || '#475569',
                          border: `1px solid ${SKILL_COLORS[brief.skill] || '#475569'}30`,
                        }}>{brief.skill}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-subtle)' }}>
                          <Clock size={11} />{timeAgo(brief.created_at)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 15, color: '#16a34a', marginBottom: 6 }}>
                        <IndianRupee size={12} />{brief.budget.toLocaleString('en-IN')}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, color: s.color, background: s.bg }}>
                        {s.text}
                      </span>
                    </div>
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : brief.id)}
                      className="btn btn-sm"
                      style={{
                        flex: 1, gap: 6, fontSize: 12, position: 'relative',
                        background: briefInterests.length > 0 ? 'var(--primary-soft)' : undefined,
                        color: briefInterests.length > 0 ? 'var(--primary)' : undefined,
                        borderColor: briefInterests.length > 0 ? 'var(--primary)' : undefined,
                      }}
                    >
                      <Users size={13} />
                      {briefInterests.length > 0 ? `${briefInterests.length} Interested` : 'None Yet'}
                      {pendingCount > 0 && (
                        <span style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 18, height: 18, borderRadius: '50%',
                          background: '#ef4444', color: '#fff',
                          fontSize: 10, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {pendingCount}
                        </span>
                      )}
                      {briefInterests.length > 0 && (isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </button>
                    {brief.status === 'active' && (
                      <button onClick={() => handleClose(brief.id)} className="btn btn-sm"
                        style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Close
                      </button>
                    )}
                  </div>

                  {/* Interested hustlers panel */}
                  <AnimatePresence>
                    {isExpanded && briefInterests.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>
                            Hustlers who expressed interest
                          </p>
                          {briefInterests.map((match, j) => {
                            const h = match.hustlers as any
                            const p = h?.profiles as any
                            const hName = p?.name || 'Hustler'
                            const mobile = p?.mobile?.replace(/\D/g, '') || ''
                            const waMsg = encodeURIComponent(
                              `Hi ${hName}, I'm a founder at ${startupName || 'my startup'}. I saw your interest in my Briefit posting "${brief.title}". Are you available for a quick chat?`
                            )

                            return (
                              <div key={match.id} style={{
                                padding: 12, borderRadius: 12,
                                background: match.status === 'accepted'
                                  ? 'rgba(34,197,94,0.06)'
                                  : match.status === 'rejected'
                                  ? 'rgba(239,68,68,0.04)'
                                  : 'var(--bg-muted)',
                                border: `1px solid ${match.status === 'accepted'
                                  ? 'rgba(34,197,94,0.2)'
                                  : match.status === 'rejected'
                                  ? 'rgba(239,68,68,0.12)'
                                  : 'var(--border)'}`,
                              }}>
                                {/* Hustler info row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: mobile ? 10 : 0 }}>
                                  <div style={{
                                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                    background: AVATAR_BG[j % AVATAR_BG.length],
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, color: '#fff', fontSize: 16,
                                  }}>
                                    {hName[0]}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{hName}</span>
                                      {match.status === 'accepted' && (
                                        <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>✓ Accepted</span>
                                      )}
                                      {match.status === 'rejected' && (
                                        <span style={{ fontSize: 11, color: '#ef4444' }}>Skipped</span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-subtle)', marginTop: 2, flexWrap: 'wrap' }}>
                                      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{h?.skill}</span>
                                      {p?.location && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <MapPin size={9} />{p.location}
                                        </span>
                                      )}
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}>
                                        <Star size={9} style={{ fill: '#f59e0b' }} />
                                        {Number(h?.rating || 0).toFixed(1)}
                                      </span>
                                    </div>
                                  </div>
                                  {match.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                      <button
                                        onClick={() => updateMatchStatus(match.id, 'accepted')}
                                        disabled={actionId === match.id}
                                        className="btn btn-sm"
                                        style={{ padding: '5px 10px', fontSize: 11, gap: 4, background: '#22c55e', color: '#fff', border: 'none' }}
                                      >
                                        {actionId === match.id
                                          ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                          : <><Check size={11} /> Accept</>
                                        }
                                      </button>
                                      <button
                                        onClick={() => updateMatchStatus(match.id, 'rejected')}
                                        disabled={actionId === match.id}
                                        className="btn btn-sm"
                                        style={{ padding: '5px 10px', fontSize: 11 }}
                                      >
                                        Skip
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Contact buttons — only shown when phone is available */}
                                {mobile && (
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <a
                                      href={`https://wa.me/${mobile}?text=${waMsg}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm"
                                      style={{ flex: 1, gap: 5, background: '#22c55e', color: '#fff', border: 'none', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                                    >
                                      <MessageCircle size={12} /> WhatsApp
                                    </a>
                                    <a
                                      href={`tel:+91${mobile}`}
                                      className="btn btn-primary btn-sm"
                                      style={{ flex: 1, gap: 5, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                                    >
                                      <Phone size={12} /> Call
                                    </a>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav role="entrepreneur" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
