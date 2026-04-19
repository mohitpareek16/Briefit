'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, LogOut } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { InstallPWA } from './InstallPWA'
import { createClient } from '@/lib/supabase/client'

interface NavBarProps {
  showLogout?: boolean
  showBack?: boolean
  backHref?: string
  backLabel?: string
}

export function NavBar({ showLogout, showBack, backHref, backLabel }: NavBarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 56,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Briefit</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle />
          {showLogout && (
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                width: 34, height: 34, borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-muted)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>
      <InstallPWA />
    </>
  )
}
