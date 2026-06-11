'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IndianRupee, FileText, Rocket, CalendarClock } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { SKILLS } from '@/lib/types'

export default function PostBriefPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    title: '', description: '', skill: '',
    budget: '', urgency: 'Normal', location_pref: 'Remote', deadline: '',
  })

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    else if (form.title.trim().length < 10) e.title = 'Title must be at least 10 characters'
    if (!form.description.trim()) e.description = 'Description is required'
    else if (form.description.trim().length < 20) e.description = 'Please add more detail (at least 20 characters)'
    if (!form.skill) e.skill = 'Please select a skill'
    if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) <= 0) e.budget = 'Enter a valid budget'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: brief, error } = await supabase
        .from('briefs')
        .insert({
          entrepreneur_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          skill: form.skill,
          budget: Number(form.budget),
          urgency: form.urgency,
          location_pref: form.location_pref,
          deadline: form.deadline.trim() || null,
          status: 'active',
        })
        .select('id')
        .single()

      if (error) throw error

      router.push(`/entrepreneur/matching?brief_id=${brief.id}`)
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to post brief. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout />

      <main style={{ paddingTop: 72, padding: '72px 16px 24px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Post a Brief</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Describe what you need and we'll match you with the right hustler</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Brief Title</label>
            <input className="input" placeholder="e.g. Build a landing page for my SaaS" value={form.title} onChange={(e) => set('title', e.target.value)} />
            {errors.title && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.title}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Description</label>
            <textarea className="input" rows={4} style={{ resize: 'none' }}
              placeholder="Describe deliverables, timeline, requirements..."
              value={form.description} onChange={(e) => set('description', e.target.value)} />
            {errors.description && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.description}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              Timeline / Deadline <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <CalendarClock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
              <input className="input" style={{ paddingLeft: 34 }} placeholder="e.g. 3 days, 1 week, ASAP"
                value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Skill Required</label>
              <select className="input" value={form.skill} onChange={(e) => set('skill', e.target.value)}>
                <option value="">Select skill</option>
                {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.skill && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.skill}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Budget (₹)</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                <input className="input" style={{ paddingLeft: 32 }} type="number" placeholder="5000" min="1"
                  value={form.budget} onChange={(e) => set('budget', e.target.value)} />
              </div>
              {errors.budget && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.budget}</p>}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Urgency</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Urgent', 'Normal'].map((opt) => (
                <button key={opt} type="button" onClick={() => set('urgency', opt)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10, fontSize: 13,
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.urgency === opt ? 'var(--primary-soft)' : 'var(--bg-subtle)',
                    border: `1.5px solid ${form.urgency === opt ? 'var(--primary)' : 'var(--border)'}`,
                    color: form.urgency === opt ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                  {opt === 'Urgent' ? '⚡ Urgent' : '📅 Normal'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Freelancer Location</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Remote', 'My City', 'Anywhere'].map((opt) => (
                <button key={opt} type="button" onClick={() => set('location_pref', opt)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10, fontSize: 12,
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.location_pref === opt ? 'var(--primary-soft)' : 'var(--bg-subtle)',
                    border: `1.5px solid ${form.location_pref === opt ? 'var(--primary)' : 'var(--border)'}`,
                    color: form.location_pref === opt ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {submitError && (
            <p style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center' }}>{submitError}</p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary btn-full btn-lg"
            style={{ gap: 8, marginTop: 4 }}
          >
            {loading
              ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <><Rocket size={17} /> Find My Hustler</>
            }
          </motion.button>
        </form>
      </main>

      <BottomNav role="entrepreneur" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
