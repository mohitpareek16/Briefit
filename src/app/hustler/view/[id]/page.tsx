'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, MapPin, ArrowLeft, ExternalLink, Award } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { createClient } from '@/lib/supabase/client'

const AVATAR_BG = ['#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ea580c', '#2563eb', '#b45309']

function parseSkills(raw: string): string[] {
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : [raw]
  } catch {
    return [raw]
  }
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          style={{
            fill: n <= Math.round(rating) ? '#f59e0b' : 'none',
            color: '#f59e0b',
          }}
        />
      ))}
    </span>
  )
}

export default function HustlerViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [profile, setProfile] = useState<any>(null)
  const [hustler, setHustler] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const supabase = createClient()

    const init = async () => {
      const [{ data: p }, { data: h }] = await Promise.all([
        supabase.from('profiles').select('name, location, mobile, email, avatar_url').eq('id', id).single(),
        supabase.from('hustlers').select('skill, is_active, rating, completed_briefs, bio, portfolio_url').eq('id', id).single(),
      ])

      if (!p || !h) {
        router.push('/entrepreneur/dashboard')
        return
      }

      setProfile(p)
      setHustler(h)

      let fetchedReviews: any[] = []
      try {
        const { data: r } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewee_id', id)
          .eq('reviewer_role', 'entrepreneur')
          .order('created_at', { ascending: false })
        fetchedReviews = r ?? []
      } catch {
        fetchedReviews = []
      }

      setReviews(fetchedReviews)
      setLoading(false)
    }

    init()
  }, [id, router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const initials = (profile?.name || 'H')[0].toUpperCase()
  const bgColor = AVATAR_BG[initials.charCodeAt(0) % AVATAR_BG.length]
  const skills = parseSkills(hustler?.skill || '')
  const rating = Number(hustler?.rating || 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar showLogout={false} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <main style={{ paddingTop: 72, padding: '72px 16px 40px', maxWidth: 480, margin: '0 auto' }}>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 500, color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 0', marginBottom: 20,
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Avatar + name + email + badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 28, color: '#fff',
            margin: '0 auto 12px',
          }}>
            {initials}
          </div>

          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            {profile?.name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
            {profile?.email}
          </p>

          {/* Active / Away badge */}
          {hustler?.is_active ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600,
              padding: '4px 10px', borderRadius: 8,
              background: 'rgba(34,197,94,0.12)', color: '#16a34a',
              border: '1px solid rgba(34,197,94,0.25)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Active
            </span>
          ) : (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600,
              padding: '4px 10px', borderRadius: 8,
              background: 'var(--bg-muted)', color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              Away
            </span>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: 12, fontWeight: 600,
                  padding: '4px 12px', borderRadius: 8,
                  background: 'var(--primary-soft)', color: 'var(--primary)',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="card" style={{ padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {profile?.location && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', justifyContent: 'center', marginBottom: 2 }}>
                <MapPin size={12} />
                <span style={{ fontWeight: 500, color: 'var(--text)' }}>{profile.location}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Location</p>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 2 }}>
              {hustler?.completed_briefs ?? 0}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Completed</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 2 }}>
              <Star size={14} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{rating.toFixed(1)}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Rating</p>
          </div>
        </div>

        {/* Bio */}
        {hustler?.bio && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card"
            style={{ padding: 16, marginBottom: 14 }}
          >
            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>About</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{hustler.bio}</p>
          </motion.div>
        )}

        {/* Portfolio */}
        {hustler?.portfolio_url && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={{ padding: 16, marginBottom: 14 }}
          >
            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>Portfolio</p>
            <a
              href={hustler.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--primary)', fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={14} />
              View Portfolio
            </a>
          </motion.div>
        )}

        {/* Reviews */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Award size={16} color="var(--primary)" />
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
              Aura Points {reviews.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({reviews.length})</span>}
            </p>
          </div>

          {reviews.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 20px',
              background: 'var(--bg-muted)', borderRadius: 14,
              border: '1px solid var(--border)',
            }}>
              <Star size={32} style={{ margin: '0 auto 10px', opacity: 0.2, display: 'block', color: 'var(--text-subtle)' }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>No Aura Points yet</p>
              <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>Aura Points from entrepreneurs will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id ?? i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card"
                  style={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                        Verified Entrepreneur
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {review.created_at ? timeAgo(review.created_at) : ''}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <StarRow rating={Number(review.rating ?? 0)} />
                    </div>
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {review.comment}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
