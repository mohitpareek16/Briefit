'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, Rocket, ArrowRight, Users, FileText, Clock } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { InstallPWA } from '@/components/InstallPWA'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <InstallPWA />

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-base" style={{ color: 'var(--text)' }}>Briefit</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          <span className="badge badge-purple text-xs font-semibold">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            247 Hustlers Live Right Now
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight"
          style={{ color: 'var(--text)' }}
        >
          Where{' '}
          <span className="gradient-text">Hustle</span>
          {' '}Meets{' '}
          <span className="gradient-text">Vision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg max-w-xl mb-12 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          The fastest matching platform connecting skilled freelancers with ambitious founders.
          Post a brief, get matched in minutes.
        </motion.p>

        {/* Two cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-16"
        >
          {/* Hustler */}
          <Link href="/auth?role=hustler" className="group">
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="card p-7 text-left cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}>
                <Zap size={22} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Join as a Hustler</h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                Freelancers & skilled professionals. Get matched with founders who need your expertise — fast.
              </p>
              <div className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all"
                style={{ color: 'var(--primary)' }}>
                Start Hustling <ArrowRight size={15} />
              </div>
            </motion.div>
          </Link>

          {/* Entrepreneur */}
          <Link href="/auth?role=entrepreneur" className="group">
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="card p-7 text-left cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}>
                <Rocket size={22} style={{ color: 'var(--primary)' }} strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Join as an Entrepreneur</h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                Founders & builders. Post your brief and get matched with the perfect freelancer within minutes.
              </p>
              <div className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all"
                style={{ color: 'var(--primary)' }}>
                Launch Your Search <ArrowRight size={15} />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center gap-8 text-sm"
        >
          {[
            { icon: Users, value: '1,842', label: 'Total Hustlers' },
            { icon: FileText, value: '436', label: 'Briefs Posted' },
            { icon: Clock, value: '~2 min', label: 'Avg. Match Time' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-bold text-xl" style={{ color: 'var(--text)' }}>{s.value}</div>
              <div style={{ color: 'var(--text-subtle)' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
