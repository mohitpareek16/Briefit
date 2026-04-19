'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IndianRupee, FileText, Rocket } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { SKILLS } from '@/lib/types'

export default function PostBriefPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    title: '',
    description: '',
    skill: '',
    budget: '',
    urgency: 'Normal',
    location_pref: 'Remote',
  })

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.skill) e.skill = 'Please select a skill'
    if (!form.budget || isNaN(Number(form.budget))) e.budget = 'Enter a valid budget'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('briefs').insert({
          entrepreneur_id: user.id,
          title: form.title,
          description: form.description,
          skill: form.skill,
          budget: Number(form.budget),
          urgency: form.urgency,
          location_pref: form.location_pref,
          status: 'active',
        })
      }
    } catch {}
    router.push('/entrepreneur/matching')
  }

  return (
    <div className="min-h-screen pb-safe" style={{ background: 'var(--bg)' }}>
      <NavBar showBack backHref="/entrepreneur/dashboard" backLabel="Dashboard" showLogout />

      <main className="pt-16 pb-6 px-4 max-w-2xl mx-auto">
        <div className="py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Post a Brief</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Describe what you need and we'll match you instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Brief Title</label>
            <input className="input" placeholder="e.g. Build a landing page for my SaaS" value={form.title} onChange={(e) => set('title', e.target.value)} />
            {errors.title && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Description</label>
            <textarea className="input resize-none" rows={4}
              placeholder="Describe deliverables, timeline, requirements..."
              value={form.description} onChange={(e) => set('description', e.target.value)} />
            {errors.description && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Skill Required</label>
              <select className="input" value={form.skill} onChange={(e) => set('skill', e.target.value)}>
                <option value="">Select skill</option>
                {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.skill && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.skill}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Budget (₹)</label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                <input className="input pl-8" type="number" placeholder="5000" min="0"
                  value={form.budget} onChange={(e) => set('budget', e.target.value)} />
              </div>
              {errors.budget && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.budget}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Urgency</label>
            <div className="flex gap-3">
              {['Urgent', 'Normal'].map((opt) => (
                <button key={opt} type="button" onClick={() => set('urgency', opt)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: form.urgency === opt ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-subtle)',
                    border: `1.5px solid ${form.urgency === opt ? 'var(--primary)' : 'var(--border)'}`,
                    color: form.urgency === opt ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                  {opt === 'Urgent' ? '⚡ Urgent' : '📅 Normal'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Freelancer Location</label>
            <div className="flex gap-2">
              {['Remote', 'My City', 'Anywhere'].map((opt) => (
                <button key={opt} type="button" onClick={() => set('location_pref', opt)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: form.location_pref === opt ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-subtle)',
                    border: `1.5px solid ${form.location_pref === opt ? 'var(--primary)' : 'var(--border)'}`,
                    color: form.location_pref === opt ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary btn-full btn-lg gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Rocket size={17} /> Find My Hustler</>
            )}
          </motion.button>
        </form>
      </main>

      <BottomNav role="entrepreneur" />
    </div>
  )
}
