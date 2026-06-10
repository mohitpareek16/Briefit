'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, IndianRupee, Clock, Zap, Plus, ChevronDown, ChevronUp, MessageCircle, Phone, Star, MapPin, X, Bell, Check, Users, ExternalLink } from 'lucide-react'
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
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#fff', padding: '11px 16px', borderRadius: 14, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10, zIndex: 200, boxShadow: '0 4px 24px rgba(34,197,94,0.35)', maxWidth: 340, width: 'calc(100vw - 32px)' }}>
      <Bell size={15} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={14} /></button>
    </motion.div>
  )
}

const RATING_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {RATING_OPTIONS.map((r) => (
        <button key={r} type="button" onClick={() => onChange(r)}
          style={{
            padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: value === r ? '#f59e0b' : 'var(--bg-muted)',
            color: value === r ? '#fff' : 'var(--text-muted)',
            border: `1.5px solid ${value === r ? '#f59e0b' : 'var(--border)'}`,
            transition: 'all 0.12s',
          }}>
          {r === Math.floor(r) ? `${r}.0` : r} ⭐
        </button>
      ))}
    </div>
  )
}

const HUSTLER_SUGGESTIONS = [
  'Delivered on time and exceeded expectations!',
  'Great communication throughout the project.',
  'High quality work, would hire again.',
  'Very professional and easy to work with.',
  'Good work but needed a few revisions.',
]

export default function EntrepreneurBriefs() {
  const router = useRouter()
  const [briefs, setBriefs] = useState<any[]>([])
  const [interests, setInterests] = useState<Record<string, any[]>>({})
  const [reviews, setReviews] = useState<Record<string, string>>({}) // matchId -> review id (already reviewed)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [startupName, setStartupName] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Review modal state
  const [reviewModal, setReviewModal] = useState<{
    matchId: string; hustlerId: string; hustlerName: string; briefTitle: string
  } | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const [{ data: e }, { data: b }] = await Promise.all([
        supabase.from('entrepreneurs').select('startup_name').eq('id', user.id).single(),
        supabase.from('briefs').select('*').eq('entrepreneur_id', user.id).order('created_at', { ascending: false }),
      ])

      if (e?.startup_name) setStartupName(e.startup_name)
      const myBriefs = b || []
      setBriefs(myBriefs)

      if (myBriefs.length > 0) {
        const ids = myBriefs.map((x: any) => x.id)

        const [{ data: m }, { data: rv }] = await Promise.all([
          supabase.from('matches')
            .select('id, brief_id, status, created_at, hustler_id, hustlers(skill, rating, is_active, profiles(name, location, mobile))')
            .in('brief_id', ids)
            .order('created_at', { ascending: false }),
          supabase.from('reviews')
            .select('id, match_id')
            .eq('reviewer_id', user.id)
            .eq('reviewer_role', 'entrepreneur'),
        ])

        if (m) {
          const grouped: Record<string, any[]> = {}
          m.forEach((match: any) => {
            if (!grouped[match.brief_id]) grouped[match.brief_id] = []
            grouped[match.brief_id].push(match)
          })
          setInterests(grouped)
        }

        if (rv) {
          const reviewMap: Record<string, string> = {}
          rv.forEach((r: any) => { reviewMap[r.match_id] = r.id })
          setReviews(reviewMap)
        }

        channel = supabase.channel('entrepreneur-interests')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, async (payload) => {
            const newMatch = payload.new as any
            if (!ids.includes(newMatch.brief_id)) return
            const { data: h } = await supabase
              .from('hustlers').select('skill, rating, is_active, profiles(name, location, mobile)')
              .eq('id', newMatch.hustler_id).single()
            if (h) {
              setInterests((prev) => {
                const updated = { ...prev }
                updated[newMatch.brief_id] = [{ ...newMatch, hustlers: h }, ...(updated[newMatch.brief_id] || [])]
                return updated
              })
              const hName = (h.profiles as any)?.name || 'A hustler'
              const brief = myBriefs.find((x: any) => x.id === newMatch.brief_id)
              setToast(`${hName} is interested in "${brief?.title || 'your brief'}"`)
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

  const handleAccept = async (matchId: string, briefId: string) => {
    setActionId(matchId)
    const supabase = createClient()

    // Accept this match and reject all others for this brief
    await Promise.all([
      supabase.from('matches').update({ status: 'accepted' }).eq('id', matchId),
      supabase.from('matches').update({ status: 'rejected' }).eq('brief_id', briefId).neq('id', matchId),
      supabase.from('briefs').update({ status: 'matched' }).eq('id', briefId),
    ])

    setBriefs((prev) => prev.map((b) => b.id === briefId ? { ...b, status: 'matched' } : b))
    setInterests((prev) => {
      const updated = { ...prev }
      updated[briefId] = updated[briefId].map((m) =>
        m.id === matchId ? { ...m, status: 'accepted' } : { ...m, status: 'rejected' }
      )
      return updated
    })
    setActionId(null)
  }

  const handleDecline = async (matchId: string, briefId: string) => {
    setActionId(matchId)
    const supabase = createClient()
    await supabase.from('matches').update({ status: 'rejected' }).eq('id', matchId)
    setInterests((prev) => {
      const updated = { ...prev }
      updated[briefId] = updated[briefId].map((m) => m.id === matchId ? { ...m, status: 'rejected' } : m)
      return updated
    })
    setActionId(null)
  }

  const handleClose = async (briefId: string) => {
    const supabase = createClient()
    await supabase.from('briefs').update({ status: 'closed' }).eq('id', briefId)
    setBriefs((prev) => prev.map((b) => b.id === briefId ? { ...b, status: 'closed' } : b))
  }

  const submitReview = async () => {
    if (!reviewModal || reviewRating === 0 || !userId) return
    setReviewSubmitting(true)
    const supabase = createClient()
    const { data } = await supabase.from('reviews').insert({
      match_id: reviewModal.matchId,
      reviewer_id: userId,
      reviewee_id: reviewModal.hustlerId,
      reviewer_role: 'entrepreneur',
      rating: reviewRating,
      comment: reviewComment.trim(),
    }).select('id').single()

    if (data) {
      setReviews((prev) => ({ ...prev, [reviewModal.matchId]: data.id }))
    }
    setReviewSubmitting(false)
    setReviewModal(null)
    setReviewRating(0)
    setReviewComment('')
    setToast(`Aura Points submitted for ${reviewModal.hustlerName}!`)
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

      {/* Review modal */}
      <AnimatePresence>
        {reviewModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={(e) => { if (e.target === e.currentTarget) setReviewModal(null) }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="card" style={{ padding: 24, maxWidth: 360, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Aura Points for {reviewModal.hustlerName}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>for "{reviewModal.briefTitle}"</p>
                </div>
                <button onClick={() => setReviewModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 10 }}>Rating</label>
                <StarPicker value={reviewRating} onChange={setReviewRating} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Comment (optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {HUSTLER_SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => setReviewComment(s)}
                      style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
                        background: reviewComment === s ? 'var(--primary-soft)' : 'var(--bg-muted)',
                        color: reviewComment === s ? 'var(--primary)' : 'var(--text-muted)',
                        border: `1px solid ${reviewComment === s ? 'var(--primary)' : 'var(--border)'}`,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
                <textarea className="input" rows={3} style={{ resize: 'none' }}
                  placeholder="How was the experience working with this hustler?"
                  value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
              </div>
              <button onClick={submitReview} disabled={reviewRating === 0 || reviewSubmitting}
                className="btn btn-primary btn-full" style={{ gap: 6 }}>
                {reviewSubmitting
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <><Star size={14} /> Submit Aura Points</>
                }
              </button>
            </motion.div>
          </div>
        )}
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
              const hasAccepted = briefInterests.some((m) => m.status === 'accepted')

              return (
                <motion.div key={brief.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="card" style={{ padding: 16 }}>

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

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setExpanded(isExpanded ? null : brief.id)} className="btn btn-sm"
                      style={{
                        flex: 1, gap: 6, fontSize: 12, position: 'relative',
                        background: briefInterests.length > 0 ? 'var(--primary-soft)' : undefined,
                        color: briefInterests.length > 0 ? 'var(--primary)' : undefined,
                        borderColor: briefInterests.length > 0 ? 'var(--primary)' : undefined,
                      }}>
                      <Users size={13} />
                      {briefInterests.length > 0 ? `${briefInterests.length} Interested` : 'None Yet'}
                      {pendingCount > 0 && (
                        <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {pendingCount}
                        </span>
                      )}
                      {briefInterests.length > 0 && (isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </button>
                    {brief.status === 'active' && (
                      <button onClick={() => handleClose(brief.id)} className="btn btn-sm" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Close</button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && briefInterests.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Hustlers who expressed interest</p>
                          {briefInterests.map((match, j) => {
                            const h = match.hustlers as any
                            const p = h?.profiles as any
                            const hName = p?.name || 'Hustler'
                            const mobile = p?.mobile?.replace(/\D/g, '') || ''
                            const waMsg = encodeURIComponent(`Hi ${hName}, I'm a founder at ${startupName || 'my startup'}. I saw your interest in my Briefit posting "${brief.title}". Are you available for a quick chat?`)
                            const alreadyReviewed = !!reviews[match.id]
                            const isAccepted = match.status === 'accepted'
                            const isRejected = match.status === 'rejected'

                            return (
                              <div key={match.id} style={{
                                padding: 12, borderRadius: 12,
                                background: isAccepted ? 'rgba(34,197,94,0.06)' : isRejected ? 'rgba(239,68,68,0.04)' : 'var(--bg-muted)',
                                border: `1px solid ${isAccepted ? 'rgba(34,197,94,0.2)' : isRejected ? 'rgba(239,68,68,0.12)' : 'var(--border)'}`,
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                  <Link href={`/hustler/view/${match.hustler_id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                      background: AVATAR_BG[j % AVATAR_BG.length],
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontWeight: 700, color: '#fff', fontSize: 16, cursor: 'pointer',
                                    }}>
                                      {hName[0]}
                                    </div>
                                  </Link>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                      <Link href={`/hustler/view/${match.hustler_id}`}
                                        style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', textDecoration: 'none' }}>
                                        {hName}
                                      </Link>
                                      <Link href={`/hustler/view/${match.hustler_id}`}
                                        style={{ color: 'var(--text-subtle)', display: 'flex', textDecoration: 'none' }}>
                                        <ExternalLink size={11} />
                                      </Link>
                                      {isAccepted && <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>✓ Hired</span>}
                                      {isRejected && <span style={{ fontSize: 11, color: '#ef4444' }}>Skipped</span>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-subtle)', marginTop: 2, flexWrap: 'wrap' }}>
                                      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{h?.skill}</span>
                                      {p?.location && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><MapPin size={9} />{p.location}</span>}
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}>
                                        <Star size={9} style={{ fill: '#f59e0b' }} />{Number(h?.rating || 0).toFixed(1)}
                                      </span>
                                    </div>
                                  </div>
                                  {!hasAccepted && match.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                      <button onClick={() => handleAccept(match.id, brief.id)} disabled={actionId === match.id}
                                        className="btn btn-sm"
                                        style={{ padding: '5px 10px', fontSize: 11, gap: 4, background: '#22c55e', color: '#fff', border: 'none' }}>
                                        {actionId === match.id
                                          ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                          : <><Check size={11} /> Hire</>
                                        }
                                      </button>
                                      <button onClick={() => handleDecline(match.id, brief.id)} disabled={actionId === match.id}
                                        className="btn btn-sm" style={{ padding: '5px 10px', fontSize: 11 }}>Skip</button>
                                    </div>
                                  )}
                                  {hasAccepted && match.status === 'pending' && (
                                    <span style={{ fontSize: 11, color: 'var(--text-subtle)', padding: '4px 8px', borderRadius: 6, background: 'var(--bg-muted)', border: '1px solid var(--border)', flexShrink: 0 }}>
                                      Not Available
                                    </span>
                                  )}
                                </div>

                                {/* Contact + review buttons */}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                  {mobile && (
                                    <>
                                      <a href={`https://wa.me/${mobile}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm"
                                        style={{ flex: 1, gap: 5, background: '#22c55e', color: '#fff', border: 'none', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, minWidth: 90 }}>
                                        <MessageCircle size={12} /> WhatsApp
                                      </a>
                                      <a href={`tel:+91${mobile}`} className="btn btn-primary btn-sm"
                                        style={{ flex: 1, gap: 5, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, minWidth: 70 }}>
                                        <Phone size={12} /> Call
                                      </a>
                                    </>
                                  )}
                                  {isAccepted && (
                                    <button
                                      onClick={() => !alreadyReviewed && setReviewModal({ matchId: match.id, hustlerId: match.hustler_id, hustlerName: hName, briefTitle: brief.title })}
                                      className="btn btn-sm"
                                      disabled={alreadyReviewed}
                                      style={{
                                        flex: 1, gap: 5, fontSize: 12, minWidth: 100,
                                        background: alreadyReviewed ? 'rgba(34,197,94,0.1)' : undefined,
                                        color: alreadyReviewed ? '#16a34a' : undefined,
                                        borderColor: alreadyReviewed ? 'rgba(34,197,94,0.3)' : undefined,
                                      }}>
                                      <Star size={12} style={{ fill: alreadyReviewed ? '#f59e0b' : 'none', color: alreadyReviewed ? '#f59e0b' : undefined }} />
                                      {alreadyReviewed ? 'Aura Points Given' : 'Leave Aura Points'}
                                    </button>
                                  )}
                                </div>
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
