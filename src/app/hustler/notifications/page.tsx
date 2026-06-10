'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

export default function HustlerNotifications() {
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data } = await supabase
        .from('matches')
        .select('*, briefs(title, skill, budget, urgency, location_pref)')
        .eq('hustler_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (data) setMatches(data)
      setLoading(false)
    }

    init()
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const statusIcon = (status: string) => {
    if (status === 'accepted') return <CheckCircle size={16} color="#22c55e" />
    if (status === 'rejected') return <XCircle size={16} color="#ef4444" />
    return <Clock size={16} color="var(--text-subtle)" />
  }

  const statusLabel = (status: string) => {
    if (status === 'accepted') return { text: 'Accepted', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }
    if (status === 'rejected') return { text: 'Declined', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
    return { text: 'Pending', color: 'var(--text-muted)', bg: 'var(--bg-muted)' }
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>
      <NavBar showLogout />

      <main style={{ paddingTop: 72, padding: '72px 16px 16px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>My Activity</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Briefs you've expressed interest in</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-subtle)' }}>
            <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>No activity yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Express interest in briefs to see them here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {matches.map((match, i) => {
              const brief = match.briefs as any
              const s = statusLabel(match.status)
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card"
                  style={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                        {brief?.title || 'Brief'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{brief?.skill}</span>
                        {brief?.budget && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#16a34a', fontWeight: 600 }}>
                            <IndianRupee size={11} />{brief.budget.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-subtle)' }}>{timeAgo(match.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      {statusIcon(match.status)}
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        color: s.color, background: s.bg,
                      }}>
                        {s.text}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav role="hustler" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
