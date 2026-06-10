'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MapPin, Phone, Briefcase, Check, LogOut, Link2, Star, X } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

const AVATAR_BG = ['#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ea580c', '#2563eb']

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={13} color="#f59e0b" style={{ fill: i <= Math.round(rating) ? '#f59e0b' : 'none' }} />
      ))}
    </div>
  )
}

export default function EntrepreneurProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [entrepreneur, setEntrepreneur] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [briefCount, setBriefCount] = useState(0)
  const [form, setForm] = useState({ name: '', mobile: '', location: '', startup_name: '', industry: '', website: '' })

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const [{ data: p }, { data: e }, { data: b }, { data: r }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('entrepreneurs').select('*').eq('id', user.id).single(),
        supabase.from('briefs').select('id', { count: 'exact' }).eq('entrepreneur_id', user.id),
        supabase.from('reviews')
          .select('*, profiles!reviewer_id(name)')
          .eq('reviewee_id', user.id)
          .eq('reviewer_role', 'hustler')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (p) setProfile(p)
      if (e) setEntrepreneur(e)
      setBriefCount(b?.length ?? 0)
      if (r) setReviews(r)

      setForm({
        name: p?.name || '', mobile: p?.mobile || '', location: p?.location || '',
        startup_name: e?.startup_name || '', industry: e?.industry || '', website: e?.website || '',
      })
      setLoading(false)
    }
    init()
  }, [router])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await Promise.all([
      supabase.from('profiles').update({ name: form.name, mobile: form.mobile, location: form.location }).eq('id', user.id),
      supabase.from('entrepreneurs').update({
        startup_name: form.startup_name,
        industry: form.industry || null,
        website: form.website || null,
      }).eq('id', user.id),
    ])

    setProfile((p: any) => ({ ...p, name: form.name, mobile: form.mobile, location: form.location }))
    setEntrepreneur((e: any) => ({ ...e, startup_name: form.startup_name, industry: form.industry, website: form.website }))
    setSaving(false); setSaved(true); setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const initials = (profile?.name || 'E')[0].toUpperCase()
  const bgColor = AVATAR_BG[initials.charCodeAt(0) % AVATAR_BG.length]
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout={false} />

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 480, margin: '0 auto' }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 28, color: '#fff', margin: '0 auto 12px',
          }}>
            {initials}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{profile?.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{profile?.email}</p>
          {entrepreneur?.startup_name && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              🚀 {entrepreneur.startup_name}
            </span>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
          <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{briefCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Briefs</div>
          </div>
          <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{reviews.length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Aura Points</div>
          </div>
          <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>
              {reviews.length > 0 ? Number(avgRating).toFixed(1) : '—'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Avg Rating</div>
          </div>
        </div>

        {/* Profile edit */}
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Profile Details</p>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-sm" style={{ fontSize: 12 }}>Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(false)} className="btn btn-sm" style={{ fontSize: 12 }}>
                  <X size={12} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm" style={{ fontSize: 12, gap: 5 }}>
                  {saving
                    ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    : saved ? <><Check size={12} /> Saved</> : 'Save'
                  }
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {[
                    { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Your name' },
                    { key: 'startup_name', label: 'Startup Name', icon: Briefcase, type: 'text', placeholder: 'Startup name' },
                    { key: 'mobile', label: 'Mobile', icon: Phone, type: 'tel', placeholder: '9876543210' },
                    { key: 'location', label: 'Location', icon: MapPin, type: 'text', placeholder: 'City' },
                    { key: 'industry', label: 'Industry', icon: Briefcase, type: 'text', placeholder: 'e.g. FinTech, EdTech' },
                    { key: 'website', label: 'Website', icon: Link2, type: 'url', placeholder: 'https://...' },
                  ].map(({ key, label, icon: Icon, type, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                        <input className="input" style={{ paddingLeft: 34 }} type={type} placeholder={placeholder}
                          value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: User, label: 'Name', value: profile?.name },
                    { icon: Briefcase, label: 'Startup', value: entrepreneur?.startup_name || 'Not set' },
                    { icon: Phone, label: 'Mobile', value: profile?.mobile || 'Not set' },
                    { icon: MapPin, label: 'Location', value: profile?.location || 'Not set' },
                    ...(entrepreneur?.industry ? [{ icon: Briefcase, label: 'Industry', value: entrepreneur.industry }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={14} color="var(--text-subtle)" />
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{label}</p>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                  {entrepreneur?.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Link2 size={14} color="var(--text-subtle)" />
                      </div>
                      <a href={entrepreneur.website} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
                        Visit Website →
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reviews from hustlers */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Star size={16} color="#f59e0b" style={{ fill: '#f59e0b' }} />
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Aura Points from Hustlers</p>
            {reviews.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {Number(avgRating).toFixed(1)} avg
              </span>
            )}
          </div>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-subtle)' }}>
              <p style={{ fontSize: 13 }}>No Aura Points yet</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>Aura Points from hustlers will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Stars rating={r.rating} />
                    <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{timeAgo(r.created_at)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>"{r.comment}"</p>}
                  <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 6 }}>
                    — {(r.profiles as any)?.name || 'Verified Hustler'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="btn btn-sm"
          style={{ width: '100%', gap: 8, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </main>

      <BottomNav role="entrepreneur" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
