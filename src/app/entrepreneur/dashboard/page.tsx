'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, MapPin, Plus, Users, TrendingUp, Clock, Zap } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

const SKILL_FILTERS = ['All', 'Design', 'Development', 'Marketing', 'Content Writing', 'Video Editing', 'Social Media']

const MOCK_HUSTLERS = [
  { id: '1', name: 'Arjun Mehta', skill: 'Development', location: 'Bangalore', is_active: true, rating: 4.9, completed_briefs: 34 },
  { id: '2', name: 'Priya Singh', skill: 'Design', location: 'Mumbai', is_active: true, rating: 4.8, completed_briefs: 28 },
  { id: '3', name: 'Rohit Kumar', skill: 'Marketing', location: 'Delhi', is_active: false, rating: 4.7, completed_briefs: 22 },
  { id: '4', name: 'Sneha Patel', skill: 'Content Writing', location: 'Pune', is_active: true, rating: 5.0, completed_briefs: 41 },
  { id: '5', name: 'Vikram Nair', skill: 'Video Editing', location: 'Chennai', is_active: false, rating: 4.6, completed_briefs: 19 },
  { id: '6', name: 'Ananya Rao', skill: 'Social Media', location: 'Hyderabad', is_active: true, rating: 4.8, completed_briefs: 31 },
  { id: '7', name: 'Karan Gupta', skill: 'Development', location: 'Remote', is_active: true, rating: 4.9, completed_briefs: 56 },
  { id: '8', name: 'Meera Joshi', skill: 'Design', location: 'Jaipur', is_active: false, rating: 4.7, completed_briefs: 25 },
  { id: '9', name: 'Aditya Shah', skill: 'Marketing', location: 'Ahmedabad', is_active: true, rating: 4.8, completed_briefs: 38 },
  { id: '10', name: 'Tanvi Desai', skill: 'Content Writing', location: 'Remote', is_active: true, rating: 4.9, completed_briefs: 47 },
  { id: '11', name: 'Rahul Verma', skill: 'Video Editing', location: 'Kolkata', is_active: false, rating: 4.5, completed_briefs: 16 },
  { id: '12', name: 'Ishaan Malhotra', skill: 'Social Media', location: 'Gurgaon', is_active: true, rating: 4.8, completed_briefs: 29 },
]

const AVATAR_BG = ['#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ea580c', '#2563eb', '#b45309']

function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<number | null>(null)
  useEffect(() => {
    const start = Date.now()
    const dur = 1500
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      setCount(Math.floor(p * target))
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [target])
  return <>{count.toLocaleString('en-IN')}</>
}

export default function EntrepreneurDashboard() {
  const [filter, setFilter] = useState('All')
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (p) setProfile(p)
    })
  }, [])

  const filtered = filter === 'All'
    ? MOCK_HUSTLERS
    : MOCK_HUSTLERS.filter((h) => h.skill.toLowerCase().includes(filter.toLowerCase()))

  const liveCount = MOCK_HUSTLERS.filter((h) => h.is_active).length

  return (
    <div className="min-h-screen pb-safe" style={{ background: 'var(--bg)' }}>
      <NavBar showLogout />

      <main className="pt-16 pb-4 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="py-5">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            Hey {profile?.name?.split(' ')[0] || 'Founder'} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Find the perfect hustler for your next brief</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="pulse-dot" />
              <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                <Counter target={liveCount} />
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Live Now</p>
          </div>
          <div className="card p-4">
            <div className="font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>
              <Counter target={1842} />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Hustlers</p>
          </div>
          <div className="card p-4">
            <div className="font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>~2 min</div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg. Match</p>
          </div>
        </div>

        {/* Skill filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {SKILL_FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="flex-shrink-0 btn btn-sm"
              style={{
                background: filter === f ? 'var(--primary)' : 'var(--bg-muted)',
                color: filter === f ? 'white' : 'var(--text-muted)',
                border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Hustler grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4 cursor-pointer card-interactive"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}>
                  {h.name[0]}
                </div>
                {h.is_active ? (
                  <span className="badge badge-green text-xs py-0.5 gap-1">
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    Live
                  </span>
                ) : (
                  <span className="badge badge-gray text-xs py-0.5">Away</span>
                )}
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{h.name}</p>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{h.skill}</p>
              <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--text-subtle)' }}>
                <MapPin size={10} />{h.location}
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-0.5" style={{ color: '#f59e0b' }}>
                  <Star size={11} className="fill-current" />
                  <span style={{ color: 'var(--text-muted)' }}>{h.rating}</span>
                </div>
                <span style={{ color: 'var(--text-subtle)' }}>{h.completed_briefs} done</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Post Brief FAB */}
      <Link href="/entrepreneur/post-brief">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-20 right-5 z-40 flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm shadow-xl cursor-pointer"
          style={{ background: 'var(--primary)', color: 'white', boxShadow: '0 8px 30px color-mix(in srgb, var(--primary) 40%, transparent)' }}
        >
          <Plus size={18} /> Post a Brief
        </motion.div>
      </Link>

      <BottomNav role="entrepreneur" />
    </div>
  )
}
