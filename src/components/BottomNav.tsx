'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Bell, User, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface BottomNavProps {
  role: 'hustler' | 'entrepreneur'
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()

  const nav = role === 'hustler'
    ? [
        { href: '/hustler/dashboard',      icon: Home,     label: 'Home' },
        { href: '/hustler/briefs',          icon: FileText, label: 'Briefs' },
        { href: '/hustler/notifications',   icon: Bell,     label: 'Alerts' },
        { href: '/hustler/profile',         icon: User,     label: 'Profile' },
      ]
    : [
        { href: '/entrepreneur/dashboard',  icon: Home,     label: 'Home' },
        { href: '/entrepreneur/post-brief', icon: Plus,     label: 'Post' },
        { href: '/entrepreneur/briefs',     icon: FileText, label: 'Briefs' },
        { href: '/entrepreneur/profile',    icon: User,     label: 'Profile' },
      ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      height: 60,
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' }}
          >
            {active && (
              <motion.div
                layoutId="tab-bg"
                style={{ position: 'absolute', inset: '4px 6px', borderRadius: 10, background: 'var(--primary-soft)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon size={20} color={active ? 'var(--primary)' : 'var(--text-subtle)'} strokeWidth={active ? 2.5 : 2} style={{ position: 'relative' }} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? 'var(--primary)' : 'var(--text-subtle)', position: 'relative' }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
