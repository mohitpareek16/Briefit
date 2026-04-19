"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Rocket, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] dark:bg-[#0a0a0f] light:bg-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-700/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl" />
      </div>

      {/* Dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-30" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center neon-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">Briefit</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ThemeToggle />
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium
            bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            247 Hustlers Live Right Now
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white dark:text-white"
        >
          Where{" "}
          <span className="gradient-text">Hustle</span>
          <br />
          Meets{" "}
          <span className="gradient-text">Vision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-16 leading-relaxed"
        >
          The fastest matching platform connecting skilled freelancers with ambitious founders.
          Post a brief, get matched instantly, and get things done.
        </motion.p>

        {/* Two cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl"
        >
          {/* Hustler Card */}
          <Link href="/hustler/register" className="group">
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl p-8 cursor-pointer
                glass border border-white/10 bg-white/5
                hover:border-purple-500/40 hover:bg-purple-500/5
                transition-all duration-300"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400
                  flex items-center justify-center mb-6 mx-auto
                  group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Join as a Hustler</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Freelancers, creators & skilled professionals.
                  Get matched with founders who need your expertise — fast.
                </p>

                <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold text-sm
                  group-hover:gap-3 transition-all duration-200">
                  Start Hustling
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Entrepreneur Card */}
          <Link href="/entrepreneur/register" className="group">
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl p-8 cursor-pointer
                glass border border-white/10 bg-white/5
                hover:border-cyan-500/40 hover:bg-cyan-500/5
                transition-all duration-300"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-400
                  flex items-center justify-center mb-6 mx-auto
                  group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                  <Rocket className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Join as an Entrepreneur</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Founders & startup builders. Post your brief and get matched with
                  the perfect freelancer within minutes.
                </p>

                <div className="flex items-center justify-center gap-2 text-cyan-400 font-semibold text-sm
                  group-hover:gap-3 transition-all duration-200">
                  Launch Your Search
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex items-center gap-8 mt-16 text-sm text-slate-500"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">1,842</div>
            <div>Total Hustlers</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">436</div>
            <div>Briefs Posted</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">2min</div>
            <div>Avg. Match Time</div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
