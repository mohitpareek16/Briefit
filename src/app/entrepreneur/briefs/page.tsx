'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, IndianRupee, Clock, Zap, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

const SKILL_COLORS: Record<string, string> = {
  Development: '#7c3aed', Design: '#0891b2', 'Content Writing': '#16a34a',
  'Social Media': '#db2777', 'Video Editing': '#ea580c', Marketing: '#2563eb',
  Finance: '#b45309', Legal: '#6b21a8', Other: '#475569',
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

export default function EntrepreneurBriefs() {
  const router = useRouter()
  const [briefs, setBriefs] = useState<any[]>([])
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: b } = await supabase
        .from('briefs')
        .select('*')
        .eq('entrepreneur_id', user.id)
        .order('created_at', { ascending: false })

      if (b) {
        setBriefs(b)
        // Fetch match counts for each brief
        if (b.length > 0) {
          const ids = b.map((x: any) => x.id)
          const { data: m } = await supabase
            .from('matches')
            .select('brief_id')
            .in('brief_id', ids)

          if (m) {
            const counts: Record<string, number> = {}
            m.forEach((x: any) => { counts[x.brief_id] = (counts[x.brief_id] || 0) + 1 })
            setMatchCounts(counts)
          }
        }
      }

      setLoading(false)
    }

    init()
  }, [router])

  const handleClose = async (briefId: string) => {
    const supabase = createClient()
    await supabase.from('briefs').update({ status: 'closed' }).eq('id', briefId)
    setBriefs((prev) => prev.map((b) => b.id === briefId ? { ...b, status: 'closed' } : b))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const statusStyle = (status: string) => {
    if (status === 'active') return { color: '#16a34a', bg: 'rgba(34,197,94,0.1)', text: 'Active' }
    if (status === 'matched') return { color: '#2563eb', bg: 'rgba(37,99,235,0.1)', text: 'Matched' }
    return { color: 'var(--text-muted)', bg: 'var(--bg-muted)', text: 'Closed' }
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout />

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="var(--primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>My Briefs</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{briefs.length} posted</p>
            </div>
          </div>
          <Link href="/entrepreneur/post-brief" className="btn btn-primary btn-sm" style={{ gap: 6, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Plus size={14} /> New Brief
          </Link>
        </div>

        {briefs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-subtle)' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>No briefs posted yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Post your first brief to find a hustler</p>
            <Link href="/entrepreneur/post-brief" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16, gap: 6, textDecoration: 'none' }}>
              <Plus size={15} /> Post a Brief
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {briefs.map((brief, i) => {
              const s = statusStyle(brief.status)
              const mCount = matchCounts[brief.id] || 0
              return (
                <motion.div
                  key={brief.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card"
                  style={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{brief.title}</span>
                        {brief.urgency === 'Urgent' && (
                          <span className="badge badge-red" style={{ fontSize: 10, padding: '2px 6px', gap: 3 }}>
                            <Zap size={9} /> Urgent
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                        {brief.description?.length > 100 ? brief.description.slice(0, 100) + '…' : brief.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
                        <span style={{
                          fontWeight: 500, padding: '2px 8px', borderRadius: 6,
                          background: `${SKILL_COLORS[brief.skill] || '#475569'}18`,
                          color: SKILL_COLORS[brief.skill] || '#475569',
                          border: `1px solid ${SKILL_COLORS[brief.skill] || '#475569'}30`,
                        }}>{brief.skill}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-subtle)' }}>
                          <Clock size={11} />{timeAgo(brief.created_at)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-subtle)' }}>
                          <Users size={11} />{mCount} interested
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 15, color: '#16a34a', marginBottom: 6 }}>
                        <IndianRupee size={12} />{brief.budget.toLocaleString('en-IN')}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, color: s.color, background: s.bg }}>
                        {s.text}
                      </span>
                    </div>
                  </div>

                  {brief.status === 'active' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        href={`/entrepreneur/matching?brief_id=${brief.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12 }}
                      >
                        View Matches
                      </Link>
                      <button
                        onClick={() => handleClose(brief.id)}
                        className="btn btn-sm"
                        style={{ flex: 1, fontSize: 12, color: 'var(--text-muted)' }}
                      >
                        Close Brief
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav role="entrepreneur" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
