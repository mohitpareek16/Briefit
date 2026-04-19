'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, User, MapPin, Phone, ChevronRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SKILLS, HEARD_FROM } from '@/lib/types'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function HustlerOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  const [form, setForm] = useState({
    name: '',
    skill: '',
    mobile: '',
    location: '',
    heard_from: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth?role=hustler'); return }
      setUser(data.user)
      setForm((f) => ({ ...f, name: data.user.user_metadata?.full_name || '' }))
    })
  }, [router])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.skill
    if (step === 2) return form.mobile.trim() && form.location.trim()
    if (step === 3) return form.heard_from
    return false
  }

  const handleSubmit = async () => {
    if (!canNext()) return
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: pe } = await supabase.from('profiles').upsert({
        id: user.id,
        role: 'hustler',
        name: form.name,
        email: user.email,
        mobile: form.mobile,
        location: form.location,
        heard_from: form.heard_from,
        avatar_url: user.user_metadata?.avatar_url || null,
        onboarded: true,
      })
      if (pe) throw pe

      const { error: he } = await supabase.from('hustlers').upsert({
        id: user.id,
        skill: form.skill,
        is_active: false,
      })
      if (he) throw he

      router.push('/hustler/dashboard')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const steps = [
    { n: 1, label: 'About You' },
    { n: 2, label: 'Contact' },
    { n: 3, label: 'Final Step' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-base" style={{ color: 'var(--text)' }}>Briefit</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: step >= s.n ? 'var(--primary)' : 'var(--bg-muted)',
                      color: step >= s.n ? 'white' : 'var(--text-subtle)',
                    }}>
                    {s.n}
                  </div>
                  <span className="text-xs mt-1" style={{ color: step === s.n ? 'var(--primary)' : 'var(--text-subtle)' }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2 mb-4 transition-all"
                    style={{ background: step > s.n ? 'var(--primary)' : 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Your Profile</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Tell founders who you are</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                      <input className="input pl-9" placeholder="Your full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Primary Skill</label>
                    <select className="input" value={form.skill} onChange={(e) => set('skill', e.target.value)}>
                      <option value="">Select your skill</option>
                      {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Contact Details</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Shared only when you accept a match</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="input w-20 text-center flex-shrink-0" style={{ padding: '10px 8px' }}>+91</div>
                      <div className="relative flex-1">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                        <input className="input pl-9" placeholder="9876543210" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} type="tel" maxLength={10} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                      <input className="input pl-9" placeholder="City, e.g. Mumbai" value={form.location} onChange={(e) => set('location', e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>One Last Thing</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Help us understand how you found us</p>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Where did you hear about Briefit?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {HEARD_FROM.map((h) => (
                      <button key={h} onClick={() => set('heard_from', h)}
                        className="p-3 rounded-xl text-sm font-medium text-left transition-all"
                        style={{
                          background: form.heard_from === h ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-subtle)',
                          border: `1px solid ${form.heard_from === h ? 'var(--primary)' : 'var(--border)'}`,
                          color: form.heard_from === h ? 'var(--primary)' : 'var(--text-muted)',
                        }}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-center" style={{ color: '#dc2626' }}>{error}</p>
                )}
              </>
            )}
          </motion.div>

          {/* Nav buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary gap-2">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="btn btn-primary btn-full gap-2">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canNext() || loading}
                className="btn btn-primary btn-full gap-2">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Join the Hustle <Zap size={15} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
