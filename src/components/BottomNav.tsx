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

  const hustlerNav = [
    { href: '/hustler/dashboard', icon: Home, label: 'Home' },
    { href: '/hustler/briefs', icon: FileText, label: 'Briefs' },
    { href: '/hustler/notifications', icon: Bell, label: 'Alerts' },
    { href: '/hustler/profile', icon: User, label: 'Profile' },
  ]

  const entrepreneurNav = [
    { href: '/entrepreneur/dashboard', icon: Home, label: 'Home' },
    { href: '/entrepreneur/post-brief', icon: Plus, label: 'Post' },
    { href: '/entrepreneur/briefs', icon: FileText, label: 'Briefs' },
    { href: '/entrepreneur/profile', icon: User, label: 'Profile' },
  ]

  const items = role === 'hustler' ? hustlerNav : entrepreneurNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className="flex flex-col items-center justify-center gap-1 py-2 relative">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-subtle)' }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-subtle)' }}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
