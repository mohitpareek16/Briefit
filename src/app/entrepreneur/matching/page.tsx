'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Star, MapPin, Phone, MessageCircle, Check, ArrowLeft } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { createClient } from '@/lib/supabase/client'

const STEPS = ['Scanning profiles...', 'Analyzing skills...', 'Ranking by availability...', 'Done!']

const MATCHES = [
  { id: '1', name: 'Arjun Mehta', skill: 'Development', location: 'Bangalore', available: true, rating: 4.9, done: 34, phone: '919876543210', bg: '#7c3aed' },
  { id: '2', name: 'Karan Gupta', skill: 'Development', location: 'Remote', available: true, rating: 4.9, done: 56, phone: '919876543211', bg: '#0891b2' },
  { id: '3', name: 'Nikhil Reddy', skill: 'Development', location: 'Hyderabad', available: false, availableIn: '2h', rating: 4.9, done: 61, phone: '919876543212', bg: '#16a34a' },
  { id: '4', name: 'Priya Singh', skill: 'Design', location: 'Mumbai', available: true, rating: 4.8, done: 28, phone: '919876543213', bg: '#db2777' },
]

function SpinnerRings() {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 2 + i, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full border-2"
          style={{
            inset: `${i * 10}px`,
            borderColor: 'transparent',
            borderTopColor: i === 0 ? 'var(--primary)' : i === 1 ? '#a78bfa' : '#c4b5fd',
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}
        >
          🧠
        </motion.div>
      </div>
    </div>
  )
}

export default function MatchingPage() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [startupName, setStartupName] = useState('Your Startup')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: e } = await supabase.from('entrepreneurs').select('startup_name').eq('id', data.user.id).single()
      if (e?.startup_name) setStartupName(e.startup_name)
    })
  }, [])

  useEffect(() => {
    const total = 3500
    const stepDur = total / STEPS.length
    STEPS.forEach((_, i) => setTimeout(() => setStep(i), i * stepDur))

    const interval = setInterval(() => setProgress((p) => Math.min(p + 1, 100)), total / 100)
    const timer = setTimeout(() => { setDone(true); clearInterval(interval) }, total + 400)

    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [])

  const waLink = (name: string, phone: string) => {
    const msg = encodeURIComponent(
      `Hi ${name}, I'm a founder at ${startupName}. I found your profile on Briefit and I'd love to discuss a brief with you. Are you available for a quick chat?`
    )
    return `https://wa.me/${phone}?text=${msg}`
  }

  return (
    <div className="min-h-screen pb-safe" style={{ background: 'var(--bg)' }}>
      <NavBar showBack backHref="/entrepreneur/post-brief" backLabel="Edit Brief" showLogout />

      <main className="pt-16 pb-8 px-4 min-h-screen flex flex-col items-center justify-center max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center w-full max-w-xs">
              <SpinnerRings />
              <h2 className="text-xl font-bold mt-6 mb-2" style={{ color: 'var(--text)' }}>
                Making the perfect match...
              </h2>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                <motion.div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--primary)' }} />
              </div>

              <div className="space-y-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center justify-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: i < step ? '#22c55e' : i === step ? 'var(--primary)' : 'var(--bg-muted)',
                      }}>
                      {i < step && <Check size={10} className="text-white" />}
                    </div>
                    <span style={{ color: i <= step ? 'var(--text)' : 'var(--text-subtle)' }}>{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }} className="w-full">
              <div className="text-center mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: '#22c55e' }}>
                  <Check size={26} className="text-white" strokeWidth={3} />
                </motion.div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
                  {MATCHES.length} Matches Found!
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Reach out directly — the hustler doesn't have your contact yet.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {MATCHES.map((m, i) => (
                  <motion.div key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="card p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
                        style={{ background: m.bg }}>
                        {m.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{m.name}</span>
                          {m.available ? (
                            <span className="badge badge-green text-xs py-0.5">Live</span>
                          ) : (
                            <span className="badge badge-orange text-xs py-0.5">in {(m as any).availableIn}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                          <span style={{ color: 'var(--primary)' }}>{m.skill}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><MapPin size={10} />{m.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3 text-xs">
                      <div className="flex items-center gap-0.5" style={{ color: '#f59e0b' }}>
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={11} className={j < Math.floor(m.rating) ? 'fill-current' : ''} />
                        ))}
                        <span className="ml-1" style={{ color: 'var(--text-muted)' }}>{m.rating}</span>
                      </div>
                      <span style={{ color: 'var(--text-subtle)' }}>{m.done} completed</span>
                    </div>

                    <div className="flex gap-2">
                      <a href={waLink(m.name, m.phone)} target="_blank" rel="noopener noreferrer"
                        className="flex-1 btn btn-sm gap-1.5 text-white" style={{ background: '#22c55e', border: 'none' }}>
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                      <a href={`tel:+${m.phone}`}
                        className="flex-1 btn btn-sm gap-1.5 btn-primary">
                        <Phone size={13} /> Call
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/entrepreneur/dashboard" className="btn btn-ghost gap-1.5 text-sm">
                  <ArrowLeft size={15} /> Back to Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
