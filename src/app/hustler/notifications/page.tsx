'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, IndianRupee, CheckCircle, XCircle, Clock, Star, X, MessageCircle } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map((i) => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <Star size={26} color="#f59e0b" style={{ fill: i <= (hover || value) ? '#f59e0b' : 'none', transition: 'all 0.1s' }} />
        </button>
      ))}
    </div>
  )
}

export default function HustlerNotifications() {
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [myName, setMyName] = useState('')

  // Reviews I've received (entrepreneur → me)
  const [receivedReviews, setReceivedReviews] = useState<Record<string, any>>({}) // matchId → review
  // Reviews I've given (me → entrepreneur)
  const [givenReviews, setGivenReviews] = useState<Record<string, string>>({}) // matchId → review id

  // Review modal (hustler reviews entrepreneur)
  const [reviewModal, setReviewModal] = useState<{
    matchId: string; entrepreneurId: string; entrepreneurName: string; briefTitle: string
  } | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // Review request sent
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const [{ data: prof }, { data: m }] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user.id).single(),
        supabase.from('matches')
          .select('*, briefs(id, title, skill, budget, urgency, entrepreneur_id)')
          .eq('hustler_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
      ])

      if (prof?.name) setMyName(prof.name)
      const myMatches = m || []
      setMatches(myMatches)

      if (myMatches.length > 0) {
        const matchIds = myMatches.map((x: any) => x.id)
        const entrepreneurIds = Array.from(new Set(myMatches.map((x: any) => (x.briefs as any)?.entrepreneur_id).filter(Boolean))) as string[]

        const [{ data: received }, { data: given }] = await Promise.all([
          supabase.from('reviews').select('*, profiles!reviewer_id(name)').eq('reviewee_id', user.id).eq('reviewer_role', 'entrepreneur').in('match_id', matchIds),
          supabase.from('reviews').select('id, match_id').eq('reviewer_id', user.id).eq('reviewer_role', 'hustler').in('match_id', matchIds),
        ])

        if (received) {
          const map: Record<string, any> = {}
          received.forEach((r: any) => { map[r.match_id] = r })
          setReceivedReviews(map)
        }
        if (given) {
          const map: Record<string, string> = {}
          given.forEach((r: any) => { map[r.match_id] = r.id })
          setGivenReviews(map)
        }
      }

      setLoading(false)
    }

    init()
  }, [router])

  const handleRequestReview = async (matchId: string, entrepreneurId: string, briefTitle: string, entrepreneurName: string) => {
    // Mark as requested locally
    setRequestedIds((prev) => { const s = new Set(Array.from(prev)); s.add(matchId); return s })

    // Generate a WhatsApp message to the entrepreneur asking for a review
    const supabase = createClient()
    const { data: ep } = await supabase.from('profiles').select('mobile').eq('id', entrepreneurId).single()
    const mobile = ep?.mobile?.replace(/\D/g, '') || ''
    if (mobile) {
      const msg = encodeURIComponent(`Hi ${entrepreneurName}, I loved working on "${briefTitle}" with you! Could you please leave me a review on Briefit? It really helps my profile. Thank you! 🙏`)
      window.open(`https://wa.me/${mobile}?text=${msg}`, '_blank')
    }
  }

  const submitReview = async () => {
    if (!reviewModal || reviewRating === 0 || !userId) return
    setReviewSubmitting(true)
    const supabase = createClient()
    const { data } = await supabase.from('reviews').insert({
      match_id: reviewModal.matchId,
      reviewer_id: userId,
      reviewee_id: reviewModal.entrepreneurId,
      reviewer_role: 'hustler',
      rating: reviewRating,
      comment: reviewComment.trim(),
    }).select('id').single()

    if (data) {
      setGivenReviews((prev) => ({ ...prev, [reviewModal.matchId]: data.id }))
    }
    setReviewSubmitting(false)
    setReviewModal(null)
    setReviewRating(0)
    setReviewComment('')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const statusIcon = (status: string) => {
    if (status === 'accepted') return <CheckCircle size={16} color="#22c55e" />
    if (status === 'rejected') return <XCircle size={16} color="#ef4444" />
    return <Clock size={16} color="var(--text-subtle)" />
  }

  const statusLabel = (status: string) => {
    if (status === 'accepted') return { text: 'Accepted', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }
    if (status === 'rejected') return { text: 'Declined', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
    return { text: 'Pending', color: 'var(--text-muted)', bg: 'var(--bg-muted)' }
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout />

      {/* Review modal */}
      <AnimatePresence>
        {reviewModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={(e) => { if (e.target === e.currentTarget) setReviewModal(null) }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="card" style={{ padding: 24, maxWidth: 360, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Review {reviewModal.entrepreneurName}</h3>
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
                <textarea className="input" rows={3} style={{ resize: 'none' }}
                  placeholder="How was working with this founder?"
                  value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
              </div>
              <button onClick={submitReview} disabled={reviewRating === 0 || reviewSubmitting}
                className="btn btn-primary btn-full" style={{ gap: 6 }}>
                {reviewSubmitting
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <><Star size={14} /> Submit Review</>
                }
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>My Activity</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Briefs applied to + reviews</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-subtle)' }}>
            <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>No activity yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Express interest in briefs to see them here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {matches.map((match, i) => {
              const brief = match.briefs as any
              const sl = statusLabel(match.status)
              const isAccepted = match.status === 'accepted'
              const receivedReview = receivedReviews[match.id]
              const hasGivenReview = !!givenReviews[match.id]
              const hasRequested = requestedIds.has(match.id)
              const entrepreneurId = brief?.entrepreneur_id

              return (
                <motion.div key={match.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: isAccepted ? 12 : 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{brief?.title || 'Brief'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{brief?.skill}</span>
                        {brief?.budget && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#16a34a', fontWeight: 600 }}>
                            <IndianRupee size={11} />{brief.budget.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-subtle)' }}>{timeAgo(match.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      {statusIcon(match.status)}
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, color: sl.color, background: sl.bg }}>
                        {sl.text}
                      </span>
                    </div>
                  </div>

                  {/* Accepted match: show review received + actions */}
                  {isAccepted && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      {/* Review I received */}
                      {receivedReview && (
                        <div style={{ padding: 10, borderRadius: 8, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={12} color="#f59e0b" style={{ fill: s <= receivedReview.rating ? '#f59e0b' : 'none' }} />
                              ))}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{timeAgo(receivedReview.created_at)}</span>
                          </div>
                          {receivedReview.comment && (
                            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>"{receivedReview.comment}"</p>
                          )}
                          <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
                            — {(receivedReview.profiles as any)?.name || 'Founder'}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {/* Request review (only if not yet received) */}
                        {!receivedReview && entrepreneurId && (
                          <button
                            onClick={() => handleRequestReview(match.id, entrepreneurId, brief?.title || '', (receivedReview?.profiles as any)?.name || 'Founder')}
                            disabled={hasRequested}
                            className="btn btn-sm"
                            style={{
                              flex: 1, gap: 5, fontSize: 12,
                              background: hasRequested ? 'rgba(124,58,237,0.08)' : undefined,
                              color: hasRequested ? 'var(--primary)' : undefined,
                              borderColor: hasRequested ? 'var(--primary)' : undefined,
                            }}>
                            <MessageCircle size={12} />
                            {hasRequested ? 'Request Sent' : 'Request Review'}
                          </button>
                        )}

                        {/* Review the entrepreneur (only after receiving a review, or any time after accept) */}
                        <button
                          onClick={() => !hasGivenReview && entrepreneurId && setReviewModal({
                            matchId: match.id,
                            entrepreneurId,
                            entrepreneurName: (receivedReview?.profiles as any)?.name || 'Founder',
                            briefTitle: brief?.title || 'this project',
                          })}
                          disabled={hasGivenReview || !entrepreneurId}
                          className="btn btn-sm"
                          style={{
                            flex: 1, gap: 5, fontSize: 12,
                            background: hasGivenReview ? 'rgba(34,197,94,0.08)' : undefined,
                            color: hasGivenReview ? '#16a34a' : undefined,
                            borderColor: hasGivenReview ? 'rgba(34,197,94,0.3)' : undefined,
                          }}>
                          <Star size={12} style={{ fill: hasGivenReview ? '#f59e0b' : 'none', color: hasGivenReview ? '#f59e0b' : undefined }} />
                          {hasGivenReview ? 'Reviewed' : 'Review Founder'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav role="hustler" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
