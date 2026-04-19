'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, IndianRupee, Zap, Bell, Check, X, Power, FileText, Star } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'
import type { BriefWithEntrepreneur, Profile, Hustler } from '@/lib/types'

const SKILL_COLORS: Record<string, string> = {
  Development: '#7c3aed',
  Design: '#0891b2',
  'Content Writing': '#16a34a',
  'Social Media': '#db2777',
  'Video Editing': '#ea580c',
  Marketing: '#2563eb',
  Finance: '#b45309',
  Legal: '#6b21a8',
  Other: '#475569',
}

const MOCK_BRIEFS = [
  { id: '1', title: 'Build a React Landing Page', skill: 'Development', budget: 8000, urgency: 'Urgent', location_pref: 'Remote', created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: '2', title: 'Design a Brand Identity Kit', skill: 'Design', budget: 12000, urgency: 'Normal', location_pref: 'Mumbai', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '3', title: 'Write 10 SEO Blog Posts', skill: 'Content Writing', budget: 5000, urgency: 'Normal', location_pref: 'Remote', created_at: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: '4', title: 'Run Instagram Ads Campaign', skill: 'Social Media', budget: 6500, urgency: 'Urgent', location_pref: 'Remote', created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: '5', title: 'Edit 3 Product Launch Videos', skill: 'Video Editing', budget: 9000, urgency: 'Urgent', location_pref: 'Delhi', created_at: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: '6', title: 'Go-to-Market Strategy', skill: 'Marketing', budget: 15000, urgency: 'Normal', location_pref: 'Remote', created_at: new Date(Date.now() - 24 * 60000).toISOString() },
]

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff === 1) return '1 min ago'
  return `${diff} mins ago`
}

export default function HustlerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [hustler, setHustler] = useState<Hustler | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [briefs, setBriefs] = useState(MOCK_BRIEFS)
  const [matchState, setMatchState] = useState<'idle' | 'incoming' | 'accepted'>('idle')
  const [showMatch, setShowMatch] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      const { data: h } = await supabase.from('hustlers').select('*').eq('id', data.user.id).single()
      if (p) setProfile(p)
      if (h) { setHustler(h); setIsActive(h.is_active) }
    })

    // Simulate incoming match after 5s
    const t = setTimeout(() => { setMatchState('incoming'); setShowMatch(true) }, 5000)
    return () => clearTimeout(t)
  }, [])

  // Real-time briefs subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('briefs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'briefs' }, (payload) => {
        setBriefs((prev) => [payload.new as any, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

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

  return (
    <div className="min-h-screen pb-safe" style={{ background: 'var(--bg)' }}>
      <NavBar showLogout />

      <main className="pt-16 pb-4 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between py-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Hey {profile?.name?.split(' ')[0] || 'Hustler'} 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isActive ? 'You\'re visible to founders' : 'Go active to receive matches'}
            </p>
          </div>

          {/* Active Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleActive}
            disabled={toggling}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: isActive ? 'color-mix(in srgb, #22c55e 12%, transparent)' : 'var(--bg-muted)',
              border: `1.5px solid ${isActive ? '#22c55e' : 'var(--border)'}`,
              color: isActive ? '#22c55e' : 'var(--text-muted)',
            }}
          >
            {toggling ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
            ) : (
              <Power size={16} />
            )}
            {isActive ? 'Active' : 'Go Active'}
            {isActive && <span className="pulse-dot ml-0.5" />}
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Applied', value: '12' },
            { label: 'Matches', value: '4' },
            { label: 'Earnings', value: '₹24k' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className="font-bold text-lg" style={{ color: 'var(--text)' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Incoming match */}
        <AnimatePresence>
          {showMatch && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-4 mb-5 border-2"
              style={{
                background: matchState === 'accepted'
                  ? 'color-mix(in srgb, #22c55e 8%, var(--bg-subtle))'
                  : 'color-mix(in srgb, var(--primary) 8%, var(--bg-subtle))',
                borderColor: matchState === 'accepted' ? '#22c55e' : 'var(--primary)',
              }}
            >
              {matchState === 'incoming' && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bell size={15} style={{ color: 'var(--primary)' }} />
                    <span className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>Match Incoming!</span>
                    <span className="pulse-dot ml-auto" />
                  </div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text)' }}>
                    🎉 A founder needs a <strong>{profile?.role === 'hustler' ? (hustler?.skill || 'Design') : 'Design'}</strong> expert
                  </p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Accept to share your contact. The founder will reach out directly.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setMatchState('accepted')}
                      className="btn btn-sm flex-1 gap-1.5" style={{ background: '#22c55e', color: 'white', border: 'none' }}>
                      <Check size={14} /> Accept
                    </button>
                    <button onClick={() => setShowMatch(false)}
                      className="btn btn-secondary btn-sm flex-1 gap-1.5">
                      <X size={14} /> Pass
                    </button>
                  </div>
                </div>
              )}
              {matchState === 'accepted' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'color-mix(in srgb, #22c55e 20%, transparent)', border: '1px solid #22c55e' }}>
                    <Check size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-green-500">Matched!</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      The founder will call or WhatsApp if they choose you. Your contact has been shared.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Briefs feed */}
        <div className="flex items-center gap-2 mb-3">
          <FileText size={15} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Live Briefs</span>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-subtle)' }}>Updated live</span>
        </div>

        <div className="space-y-3">
          {briefs.map((brief, i) => (
            <motion.div
              key={brief.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card p-4 cursor-pointer card-interactive"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{brief.title}</span>
                    {brief.urgency === 'Urgent' && (
                      <span className="badge badge-red text-xs py-0.5">
                        <Zap size={10} /> Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="badge text-xs py-0.5 font-medium"
                      style={{ background: `${SKILL_COLORS[brief.skill]}18`, color: SKILL_COLORS[brief.skill], border: `1px solid ${SKILL_COLORS[brief.skill]}30` }}>
                      {brief.skill}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
                      <MapPin size={11} /> {brief.location_pref}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
                      <Clock size={11} /> {timeAgo(brief.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5 font-bold text-base" style={{ color: '#16a34a' }}>
                    <IndianRupee size={14} />{brief.budget.toLocaleString('en-IN')}
                  </div>
                  <button className="mt-1.5 btn btn-primary btn-sm">Apply</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <BottomNav role="hustler" />
    </div>
  )
}
