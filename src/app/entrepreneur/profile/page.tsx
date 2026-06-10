'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, MapPin, Phone, Briefcase, Check, LogOut } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

const AVATAR_BG = ['#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ea580c', '#2563eb']

export default function EntrepreneurProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [entrepreneur, setEntrepreneur] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [briefCount, setBriefCount] = useState(0)
  const [form, setForm] = useState({ name: '', mobile: '', location: '', startup_name: '' })

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const [{ data: p }, { data: e }, { data: b }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('entrepreneurs').select('*').eq('id', user.id).single(),
        supabase.from('briefs').select('id', { count: 'exact' }).eq('entrepreneur_id', user.id),
      ])

      if (p) { setProfile(p); setForm({ name: p.name || '', mobile: p.mobile || '', location: p.location || '', startup_name: e?.startup_name || '' }) }
      if (e) setEntrepreneur(e)
      setBriefCount(b?.length ?? 0)
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
      supabase.from('entrepreneurs').update({ startup_name: form.startup_name }).eq('id', user.id),
    ])

    setProfile((p: any) => ({ ...p, name: form.name, mobile: form.mobile, location: form.location }))
    setEntrepreneur((e: any) => ({ ...e, startup_name: form.startup_name }))
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
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

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout={false} />

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 480, margin: '0 auto' }}>
        {/* Avatar + name */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 28, color: '#fff', margin: '0 auto 12px',
          }}>
            {initials}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{profile?.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{profile?.email}</p>
          {entrepreneur?.startup_name && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              {entrepreneur.startup_name}
            </span>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 2 }}>{briefCount}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Briefs Posted</div>
          </div>
          <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 2 }}>🚀</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Founder</div>
          </div>
        </div>

        {/* Profile info / edit */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Profile Details</p>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-sm" style={{ fontSize: 12, padding: '5px 12px' }}>Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(false)} className="btn btn-sm" style={{ fontSize: 12, padding: '5px 12px' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm" style={{ fontSize: 12, padding: '5px 12px', gap: 5 }}>
                  {saving
                    ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    : saved ? <><Check size={12} /> Saved!</> : 'Save'
                  }
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                  <input className="input" style={{ paddingLeft: 34 }} value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>Startup Name</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                  <input className="input" style={{ paddingLeft: 34 }} value={form.startup_name} onChange={(e) => set('startup_name', e.target.value)} />
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
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: User, label: 'Name', value: profile?.name },
                { icon: Briefcase, label: 'Startup', value: entrepreneur?.startup_name || 'Not set' },
                { icon: Phone, label: 'Mobile', value: profile?.mobile || 'Not set' },
                { icon: MapPin, label: 'Location', value: profile?.location || 'Not set' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="var(--text-subtle)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-sm"
          style={{ width: '100%', gap: 8, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </main>

      <BottomNav role="entrepreneur" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
