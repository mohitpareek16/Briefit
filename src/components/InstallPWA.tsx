'use client'

import { useEffect, useState } from 'react'
import { Download, X, Share } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function InstallPWA() {
  const [prompt, setPrompt] = useState<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSHint, setShowIOSHint] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const installed = window.matchMedia('(display-mode: standalone)').matches
    setIsInstalled(installed)
    if (installed) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    const wasDismissed = sessionStorage.getItem('pwa-dismissed')
    if (wasDismissed) { setDismissed(true); return }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as any)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa-dismissed', '1')
  }

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') { setPrompt(null); setIsInstalled(true) }
  }

  if (isInstalled || dismissed) return null

  return (
    <AnimatePresence>
      {(prompt || (isIOS && !showIOSHint)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl p-4 shadow-xl flex items-start gap-3"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
            <Download size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Install Briefit</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isIOS ? 'Tap Share → "Add to Home Screen"' : 'Add to your home screen for the best experience'}
            </p>
            {!isIOS && prompt && (
              <button onClick={handleInstall} className="btn btn-primary btn-sm mt-2">
                Install App
              </button>
            )}
          </div>
          <button onClick={handleDismiss} className="btn btn-ghost p-1.5 rounded-lg flex-shrink-0">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
