'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Star, MapPin, Plus, Users, Bell, X } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

function parseSkills(raw: string | null | undefined): string[] {
  if (!raw) return []
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [raw] } catch { return [raw] }
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

const SKILL_FILTERS = ['All', 'Design', 'Development', 'Marketing', 'Content Writing', 'Video Editing', 'Social Media']
const AVATAR_BG = ['#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ea580c', '#2563eb', '#b45309']

export default function EntrepreneurDashboard() {
  const router = useRouter()
  const [filter, setFilter] = useState('All')
  const [profile, setProfile] = useState<any>(null)
  const [hustlers, setHustlers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const [{ data: p }, { data: h }, { data: myBriefs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('hustlers')
          .select('id, skill, is_active, rating, completed_briefs, profiles(name, location)')
          .order('is_active', { ascending: false })
          .order('rating', { ascending: false }),
        supabase.from('briefs').select('id, title').eq('entrepreneur_id', user.id),
      ])

      if (p) setProfile(p)
      if (h) setHustlers(h)
      setLoading(false)

      // Subscribe to interest notifications for the entrepreneur's briefs
      if (myBriefs && myBriefs.length > 0) {
        const myBriefIds = myBriefs.map((b: any) => b.id)
        const interestChannel = supabase.channel('dashboard-interests')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, async (payload) => {
            const newMatch = payload.new as any
            if (!myBriefIds.includes(newMatch.brief_id)) return
            const { data: h } = await supabase
              .from('hustlers')
              .select('profiles(name)')
              .eq('id', newMatch.hustler_id)
              .single()
            const hName = (h?.profiles as any)?.name || 'A hustler'
            const brief = myBriefs.find((b: any) => b.id === newMatch.brief_id)
            setToast(`${hName} is interested in "${brief?.title || 'your brief'}"`)
          })
          .subscribe()
        return () => { supabase.removeChannel(hustlerChannel); supabase.removeChannel(interestChannel) }
      }
    }

    init()

    // Live updates when a hustler toggles active status
    const hustlerChannel = supabase
      .channel('hustlers-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'hustlers' }, () => {
        supabase
          .from('hustlers')
          .select('id, skill, is_active, rating, completed_briefs, profiles(name, location)')
          .order('is_active', { ascending: false })
          .order('rating', { ascending: false })
          .then(({ data }) => { if (data) setHustlers(data) })
      })
      .subscribe()

    return () => { supabase.removeChannel(hustlerChannel) }
  }, [router])

  const filtered = filter === 'All'
    ? hustlers
    : hustlers.filter((h) => parseSkills(h.skill).includes(filter))

  const liveCount = hustlers.filter((h) => h.is_active).length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout />

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ paddingBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            Hey {profile?.name?.split(' ')[0] || 'Founder'} 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Find the perfect hustler for your next brief
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
          <div className="card" style={{ padding: '14px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="live-dot" />
              <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>{liveCount}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live Now</p>
          </div>
          <div className="card" style={{ padding: '14px 12px' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>{hustlers.length}</div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Hustlers</p>
          </div>
          <div className="card" style={{ padding: '14px 12px' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>~2 min</div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg. Match</p>
          </div>
        </div>

        {/* Skill filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }} className="no-scrollbar">
          {SKILL_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                background: filter === f ? 'var(--primary)' : 'var(--bg-muted)',
                color: filter === f ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Hustler grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
            <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>
              {hustlers.length === 0 ? 'No hustlers have signed up yet' : `No ${filter} hustlers yet`}
            </p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Check back soon or try a different skill filter</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {filtered.map((h, i) => {
              const pname = (h.profiles as any)?.name || 'Unknown'
              const plocation = (h.profiles as any)?.location || '—'
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card"
                  style={{ padding: 14, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#fff', fontSize: 15,
                      background: AVATAR_BG[i % AVATAR_BG.length],
                      flexShrink: 0,
                    }}>
                      {pname[0]}
                    </div>
                    {h.is_active ? (
                      <span className="badge badge-green" style={{ fontSize: 10, padding: '2px 6px', gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                        Live
                      </span>
                    ) : (
                      <span className="badge badge-gray" style={{ fontSize: 10, padding: '2px 6px' }}>Away</span>
                    )}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{pname}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {(() => { const s = parseSkills(h.skill); return s.length > 0 ? s.slice(0, 2).join(', ') + (s.length > 2 ? ` +${s.length - 2}` : '') : '—' })()}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-subtle)', marginBottom: 8 }}>
                    <MapPin size={10} />{plocation}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}>
                      <Star size={11} style={{ fill: '#f59e0b' }} />
                      <span style={{ color: 'var(--text-muted)' }}>{h.completed_briefs > 0 ? Number(h.rating).toFixed(1) : '—'}</span>
                    </div>
                    <span style={{ color: 'var(--text-subtle)' }}>{h.completed_briefs} done</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      {/* Post Brief FAB */}
      <Link href="/entrepreneur/post-brief">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed', bottom: 76, right: 20, zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 16,
            fontWeight: 700, fontSize: 14, color: '#fff',
            background: 'var(--primary)',
            boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Post a Brief
        </motion.div>
      </Link>

      <BottomNav role="entrepreneur" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
