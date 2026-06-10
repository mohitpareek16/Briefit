'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MapPin, Phone, Star, Power, Check, LogOut, Link2, FileText, X } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { SKILLS, parseSkills, serializeSkills } from '@/lib/types'

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
        <Star key={i} size={13} color="#f59e0b"
          style={{ fill: i <= Math.round(rating) ? '#f59e0b' : 'none' }} />
      ))}
    </div>
  )
}

export default function HustlerProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [hustler, setHustler] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', mobile: '', location: '',
    skills: [] as string[], bio: '', portfolio_url: '',
  })

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const [{ data: p }, { data: h }, { data: r }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('hustlers').select('*').eq('id', user.id).single(),
        supabase.from('reviews')
          .select('*, profiles!reviewer_id(name)')
          .eq('reviewee_id', user.id)
          .eq('reviewer_role', 'entrepreneur')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (p) setProfile(p)
      if (h) {
        setHustler(h)
        setIsActive(h.is_active)
        setForm({
          name: p?.name || '', mobile: p?.mobile || '',
          location: p?.location || '',
          skills: parseSkills(h.skill),
          bio: h.bio || '', portfolio_url: h.portfolio_url || '',
        })
      }
      if (r) setReviews(r)
      setLoading(false)
    }
    init()
  }, [router])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const toggleSkill = (skill: string) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }))

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await Promise.all([
      supabase.from('profiles').update({ name: form.name, mobile: form.mobile, location: form.location }).eq('id', user.id),
      supabase.from('hustlers').update({
        skill: serializeSkills(form.skills),
        bio: form.bio || null,
        portfolio_url: form.portfolio_url || null,
      }).eq('id', user.id),
    ])

    setProfile((p: any) => ({ ...p, name: form.name, mobile: form.mobile, location: form.location }))
    setHustler((h: any) => ({ ...h, skill: serializeSkills(form.skills), bio: form.bio, portfolio_url: form.portfolio_url }))
    setSaving(false); setSaved(true); setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

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

  const initials = (profile?.name || 'H')[0].toUpperCase()
  const bgColor = AVATAR_BG[initials.charCodeAt(0) % AVATAR_BG.length]
  const mySkills = parseSkills(hustler?.skill || '')
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : Number(hustler?.rating || 0)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout={false} />

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 480, margin: '0 auto' }}>
        {/* Avatar + name */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 28, color: '#fff', margin: '0 auto 12px',
          }}>
            {initials}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{profile?.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>{profile?.email}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {mySkills.map((s) => (
              <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{Number(avgRating).toFixed(1)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Avg Rating</div>
          </div>
          <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{hustler?.completed_briefs || 0}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Completed</div>
          </div>
          <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{reviews.length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Aura Points</div>
          </div>
        </div>

        {/* Active toggle */}
        <div className="card" style={{ padding: 14, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Availability</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{isActive ? 'Visible to founders' : 'Hidden from search'}</p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={toggleActive} disabled={toggling}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              background: isActive ? 'rgba(34,197,94,0.12)' : 'var(--bg-muted)',
              border: `1.5px solid ${isActive ? '#22c55e' : 'var(--border)'}`,
              color: isActive ? '#22c55e' : 'var(--text-muted)',
            }}>
            {toggling
              ? <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <Power size={14} />
            }
            {isActive ? 'Active' : 'Go Active'}
          </motion.button>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                      <input className="input" style={{ paddingLeft: 34 }} value={form.name} onChange={(e) => set('name', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>Mobile</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                      <input className="input" style={{ paddingLeft: 34 }} value={form.mobile} onChange={(e) => set('mobile', e.target.value)} type="tel" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>Location</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                      <input className="input" style={{ paddingLeft: 34 }} value={form.location} onChange={(e) => set('location', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Skills
                      {form.skills.length > 0 && <span style={{ marginLeft: 6, color: 'var(--primary)', fontWeight: 400 }}>{form.skills.length} selected</span>}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {SKILLS.map((s) => {
                        const sel = form.skills.includes(s)
                        return (
                          <button key={s} type="button" onClick={() => toggleSkill(s)}
                            style={{
                              padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                              background: sel ? 'var(--primary-soft)' : 'var(--bg-subtle)',
                              border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border)'}`,
                              color: sel ? 'var(--primary)' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                            }}>
                            {sel && <Check size={9} strokeWidth={3} />}{s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>Bio</label>
                    <textarea className="input" rows={3} style={{ resize: 'none', fontSize: 13 }} placeholder="Tell founders about yourself..."
                      value={form.bio} onChange={(e) => set('bio', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>Portfolio / LinkedIn URL</label>
                    <div style={{ position: 'relative' }}>
                      <Link2 size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                      <input className="input" style={{ paddingLeft: 34 }} placeholder="https://..." value={form.portfolio_url} onChange={(e) => set('portfolio_url', e.target.value)} type="url" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: User, label: 'Name', value: profile?.name },
                    { icon: Phone, label: 'Mobile', value: profile?.mobile || 'Not set' },
                    { icon: MapPin, label: 'Location', value: profile?.location || 'Not set' },
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
                  {hustler?.bio && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <FileText size={14} color="var(--text-subtle)" />
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Bio</p>
                        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{hustler.bio}</p>
                      </div>
                    </div>
                  )}
                  {hustler?.portfolio_url && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Link2 size={14} color="var(--text-subtle)" />
                      </div>
                      <a href={hustler.portfolio_url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
                        View Portfolio →
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reviews received */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Star size={16} color="#f59e0b" style={{ fill: '#f59e0b' }} />
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Aura Points from Founders</p>
            {reviews.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {Number(avgRating).toFixed(1)} avg
              </span>
            )}
          </div>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-subtle)' }}>
              <p style={{ fontSize: 13 }}>No Aura Points yet</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>Complete projects to earn Aura Points</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Stars rating={r.rating} />
                    <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{timeAgo(r.created_at)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>"{r.comment}"</p>}
                  <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 6 }}>
                    — {(r.profiles as any)?.name || 'Verified Founder'}
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

      <BottomNav role="hustler" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
