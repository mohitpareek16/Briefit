'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, ArrowLeft, LogOut } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { InstallPWA } from './InstallPWA'
import { createClient } from '@/lib/supabase/client'

interface NavBarProps {
  showBack?: boolean
  backHref?: string
  backLabel?: string
  showLogout?: boolean
}

export function NavBar({ showBack, backHref, backLabel, showLogout }: NavBarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          {showBack ? (
            <Link href={backHref || '/'} className="btn btn-ghost btn-sm gap-1.5 -ml-2">
              <ArrowLeft size={16} />
              <span className="text-sm">{backLabel || 'Back'}</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--primary)' }}>
                <Zap size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-base" style={{ color: 'var(--text)' }}>Briefit</span>
            </Link>
          )}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {showLogout && (
              <button onClick={handleLogout} className="btn btn-ghost w-9 h-9 p-0 rounded-lg" title="Sign out">
                <LogOut size={17} />
              </button>
            )}
          </div>
        </div>
      </header>
      <InstallPWA />
    </>
  )
}
