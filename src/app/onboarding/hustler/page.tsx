'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, User, MapPin, Phone, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SKILLS, HEARD_FROM, serializeSkills } from '@/lib/types'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function HustlerOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    skills: [] as string[],
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

  const toggleSkill = (skill: string) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }))

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.mobile.trim().length >= 10
    if (step === 2) return form.skills.length > 0 && form.location.trim()
    if (step === 3) return !!form.heard_from
    return false
  }

  const handleSubmit = async () => {
    if (!canNext() || !user) return
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
      }, { onConflict: 'id' })
      if (pe) throw pe

      const { error: he } = await supabase.from('hustlers').upsert({
        id: user.id,
        skill: serializeSkills(form.skills),
        is_active: false,
      }, { onConflict: 'id' })
      if (he) throw he

      router.push('/hustler/dashboard')
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const steps = [
    { n: 1, label: 'Contact' },
    { n: 2, label: 'Skills' },
    { n: 3, label: 'Final' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Briefit</span>
        </div>
        <ThemeToggle />
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Progress steps */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: step >= s.n ? 'var(--primary)' : 'var(--bg-muted)',
                    color: step >= s.n ? '#fff' : 'var(--text-subtle)',
                    transition: 'all 0.2s',
                  }}>
                    {s.n}
                  </div>
                  <span style={{ fontSize: 11, color: step === s.n ? 'var(--primary)' : 'var(--text-subtle)' }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 1, margin: '0 8px', marginBottom: 16, background: step > s.n ? 'var(--primary)' : 'var(--border)', transition: 'all 0.2s' }} />
                )}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            {step === 1 && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Let's get you set up</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Your phone lets founders reach you via WhatsApp & call</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                      <input className="input" style={{ paddingLeft: 36 }} placeholder="Your full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>WhatsApp / Mobile Number</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="input" style={{ width: 60, textAlign: 'center', flexShrink: 0, padding: '9px 8px', color: 'var(--text-muted)' }}>+91</div>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                        <input className="input" style={{ paddingLeft: 36 }} placeholder="9876543210" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} type="tel" maxLength={10} />
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5 }}>Shared with founders only when you accept a match</p>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Your Skills & Location</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Select all your skills — you'll only see briefs that match</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>
                    Skills
                    {form.skills.length > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 400 }}>
                        {form.skills.length} selected
                      </span>
                    )}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {SKILLS.map((s) => {
                      const selected = form.skills.includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSkill(s)}
                          style={{
                            padding: '8px 6px', borderRadius: 10, fontSize: 12,
                            fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                            background: selected ? 'var(--primary-soft)' : 'var(--bg-subtle)',
                            border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                            color: selected ? 'var(--primary)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          }}
                        >
                          {selected && <Check size={10} strokeWidth={3} />}
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                    <input className="input" style={{ paddingLeft: 36 }} placeholder="City, e.g. Mumbai" value={form.location} onChange={(e) => set('location', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>One Last Thing</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Help us understand how you found us</p>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Where did you hear about Briefit?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {HEARD_FROM.map((h) => (
                      <button key={h} type="button" onClick={() => set('heard_from', h)}
                        style={{
                          padding: '10px 12px', borderRadius: 10, fontSize: 13,
                          fontWeight: 500, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                          background: form.heard_from === h ? 'var(--primary-soft)' : 'var(--bg-subtle)',
                          border: `1px solid ${form.heard_from === h ? 'var(--primary)' : 'var(--border)'}`,
                          color: form.heard_from === h ? 'var(--primary)' : 'var(--text-muted)',
                        }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <p style={{ marginTop: 16, fontSize: 13, color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
              </>
            )}
          </motion.div>

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary" style={{ gap: 6 }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn btn-primary btn-full" style={{ gap: 6 }}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canNext() || loading} className="btn btn-primary btn-full" style={{ gap: 6 }}>
                {loading
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <><Zap size={15} /> Join the Hustle</>
                }
              </button>
            )}
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
